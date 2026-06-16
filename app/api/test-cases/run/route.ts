import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, repositories, testCases } from '@/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getRepoFiles } from '@/lib/github';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Browserbase from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser || !dbUser.githubToken) {
    return new Response('User or GitHub token not found', { status: 404 });
  }

  const body = await req.json();
  const { testIds, repoId } = body;

  if (!Array.isArray(testIds) || testIds.length === 0 || !repoId) {
    return new Response('Invalid payload', { status: 400 });
  }

  const requiredCredits = testIds.length * 10;
  if (dbUser.credits < requiredCredits) {
    return new Response(`Insufficient credits. Required: ${requiredCredits}`, { status: 402 });
  }

  const repo = await db.query.repositories.findFirst({
    where: and(eq(repositories.id, repoId), eq(repositories.userId, dbUser.id))
  });

  if (!repo) {
    return new Response('Repository not found or access denied', { status: 404 });
  }

  const files = await getRepoFiles(repo.fullName, dbUser.githubToken);
  const filesContext = files.map((f: any) => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');

  const targetTests = await db.select().from(testCases)
    .where(and(inArray(testCases.id, testIds), eq(testCases.repoId, repo.id)));

  if (targetTests.length === 0) {
    return new Response('No valid test cases found', { status: 404 });
  }

  const results = [];
  let currentCredits = dbUser.credits;

  for (const tc of targetTests) {
    await db.update(testCases).set({ status: 'running' }).where(eq(testCases.id, tc.id));

    // 1. Generate Script
    const prompt = `
You are an expert Playwright automation engineer.
We need to run the following test case:
Title: ${tc.title}
Description: ${tc.description}
Target Route: ${tc.targetRoute}
Expected Result: ${tc.expectedResult}
Global Instruction: ${repo.globalInstruction || 'None'}
Target Domain: ${repo.targetDomain || 'http://localhost:3000'}

Repository Files Context (for element selectors, API routes, etc.):
${filesContext}

Output ONLY valid Javascript code. Do NOT wrap in markdown fences. Do NOT include imports.
The code must be the interior of an async function.
You have access to a variable named 'page' which is a Playwright Page object already initialized.
Use 'console.log' extensively at each step (e.g. "Navigating to...", "Clicking button...").
Start by navigating to ${repo.targetDomain || ''}${tc.targetRoute || '/'}.
Make sure to handle standard interactions and await appropriately.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
    let script = '';
    
    try {
      const result = await model.generateContent(prompt);
      script = result.response.text();

      if (script.startsWith('```javascript')) {
        script = script.replace(/^```javascript/, '').replace(/```$/, '');
      } else if (script.startsWith('```js')) {
        script = script.replace(/^```js/, '').replace(/```$/, '');
      } else if (script.startsWith('```')) {
        script = script.replace(/^```/, '').replace(/```$/, '');
      }
    } catch (e) {
      console.error('Gemini error:', e);
      await db.update(testCases).set({ status: 'fail', logs: ['Failed to generate script'] }).where(eq(testCases.id, tc.id));
      continue;
    }

    // 2. Execute Script in Browserbase
    let session;
    let browser;
    const logs: string[] = [];

    try {
      session = await bb.sessions.create({ projectId: process.env.BROWSERBASE_PROJECT_ID! });
      
      browser = await chromium.connectOverCDP(session.connectUrl);
      const context = browser.contexts()[0] || await browser.newContext();
      const page = context.pages()[0] || await context.newPage();

      page.on('console', msg => {
        logs.push(`[${msg.type()}] ${msg.text()}`);
      });
      page.on('pageerror', err => {
        logs.push(`[page error] ${err.message}`);
      });

      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executeTest = new AsyncFunction('page', script);
      
      logs.push("Starting test execution...");
      await executeTest(page);
      logs.push("Test execution completed successfully.");

      await db.update(testCases).set({ 
        status: 'pass', 
        logs: logs,
        sessionId: session.id,
        sessionUrl: `https://browserbase.com/sessions/${session.id}`
      }).where(eq(testCases.id, tc.id));

    } catch (err: any) {
      logs.push(`[execution error] ${err.message}`);
      await db.update(testCases).set({ 
        status: 'fail', 
        logs: logs,
        sessionId: session?.id,
        sessionUrl: session ? `https://browserbase.com/sessions/${session.id}` : null
      }).where(eq(testCases.id, tc.id));
    } finally {
      if (browser) await browser.close();
    }

    // Deduct 10 credits
    currentCredits -= 10;
    await db.update(users).set({ credits: currentCredits }).where(eq(users.id, dbUser.id));

    results.push({ id: tc.id, status: 'complete' });
  }

  return NextResponse.json({ success: true, results });
}
