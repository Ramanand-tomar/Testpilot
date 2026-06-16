import { db } from '@/db';
import { users, repositories, testCases, testRuns, webhooks } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getRepoFiles } from '@/lib/github';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Browserbase from '@browserbasehq/sdk';
import { chromium } from 'playwright-core';
import crypto from 'crypto';
import { sendRunNotifications } from '@/lib/notifications';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');
const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY });

async function performRCA(tc: any, testRunId: number, repo: any, dbUser: any, filesContext: string, logs: string[], script: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `A Playwright test failed. Classify the failure and provide root cause analysis.
Return JSON only matching this schema:
{
  "failureType": "Real Bug" | "Test Fragility" | "Environment Issue" | "Auth Failure" | null,
  "rootCause": "string (plain English explanation)",
  "suggestedFix": "string (actionable recommendation)"
}

Error Logs:
${logs.join('\n')}

Test Script:
${script}

Expected Result: ${tc.expectedResult || 'None'}
Known Issues: ${repo.knownIssues || 'None'}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    const rca = JSON.parse(text);
    
    await db.update(testCases).set({
      failureType: rca.failureType,
      rootCause: rca.rootCause,
      suggestedFix: rca.suggestedFix
    }).where(eq(testCases.id, tc.id));

    // Self-Healing Logic
    if (rca.failureType === 'Test Fragility') {
      const freshUser = await db.query.users.findFirst({ where: eq(users.id, dbUser.id) });
      if (freshUser && freshUser.credits >= 10) {
        // Deduct credits for heal attempt
        await db.update(users).set({ credits: sql`${users.credits} - 10` }).where(eq(users.id, dbUser.id));

        const healPrompt = `
You are an expert Playwright automation engineer. The previous script failed due to selector/fragility issues.
Please regenerate a more robust script based on the updated repository files.

Original Script:
${script}

Error Logs:
${logs.join('\n')}

Repository Files Context:
${filesContext}

Output ONLY valid Javascript code. Do NOT wrap in markdown fences. Do NOT include imports.
The code must be the interior of an async function.
You have access to a variable named 'page' which is a Playwright Page object already initialized.
Use 'console.log' extensively. Start by navigating to ${repo.targetDomain || ''}${tc.targetRoute || '/'}.
`;
        
        let newScript = '';
        try {
          const healResult = await model.generateContent(healPrompt);
          newScript = healResult.response.text().replace(/^```javascript/, '').replace(/^```/, '').replace(/```$/, '').trim();
        } catch (e) {
          console.error("Heal generation failed:", e);
          return;
        }

        const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY || '' });
        let session;
        let browser;
        const healLogs: string[] = [];

        try {
          session = await bb.sessions.create({ projectId: process.env.BROWSERBASE_PROJECT_ID || '' });
          browser = await chromium.connectOverCDP(session.connectUrl);
          const context = browser.contexts()[0] || await browser.newContext();
          const page = context.pages()[0] || await context.newPage();

          page.on('console', msg => healLogs.push(`[${msg.type()}] ${msg.text()}`));
          page.on('pageerror', err => healLogs.push(`[page error] ${err.message}`));

          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const executeTest = new AsyncFunction('page', newScript);
          
          healLogs.push("Starting healed test execution...");
          await executeTest(page);
          healLogs.push("Healed test execution completed successfully.");

          await db.update(testCases).set({ 
            status: 'pass', 
            logs: healLogs,
            script: newScript,
            sessionId: session.id,
            sessionUrl: `https://browserbase.com/sessions/${session.id}`,
            wasHealed: true,
            healedAt: new Date(),
            healCount: sql`${testCases.healCount} + 1`
          }).where(eq(testCases.id, tc.id));

          // Adjust testRuns counts
          await db.update(testRuns).set({
            passed: sql`${testRuns.passed} + 1`,
            failed: sql`${testRuns.failed} - 1`
          }).where(eq(testRuns.id, testRunId));

        } catch (healErr: any) {
          healLogs.push(`[execution error] ${healErr.message}`);
          await db.update(testCases).set({
            logs: healLogs,
            script: newScript,
            sessionId: session?.id,
            sessionUrl: session ? `https://browserbase.com/sessions/${session.id}` : null
          }).where(eq(testCases.id, tc.id));
        } finally {
          if (browser) await browser.close();
        }
      }
    }
  } catch (e) {
    console.error("RCA/Heal failed:", e);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ secret: string }> }
) {
  const resolvedParams = await params;
  const { secret } = resolvedParams;

  if (!secret) return new Response('Missing secret', { status: 400 });

  // Validate webhook secret
  const webhook = await db.query.webhooks.findFirst({
    where: eq(webhooks.secret, secret)
  });

  if (!webhook || !webhook.isActive) {
    return new Response('Invalid or inactive webhook', { status: 401 });
  }

  // Find user and repo
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, webhook.userId)
  });

  if (!dbUser || !dbUser.githubToken) {
    return new Response('Webhook owner missing or invalid', { status: 404 });
  }

  const repo = await db.query.repositories.findFirst({
    where: eq(repositories.id, webhook.repoId)
  });

  if (!repo) {
    return new Response('Repository not found', { status: 404 });
  }

  // Get all test cases for repo
  const targetTests = await db.select().from(testCases)
    .where(eq(testCases.repoId, repo.id));

  if (targetTests.length === 0) {
    return new Response('No valid test cases found', { status: 404 });
  }

  const requiredCredits = targetTests.length * 10;
  if (dbUser.credits < requiredCredits) {
    return new Response(`Insufficient credits. Required: ${requiredCredits}`, { status: 402 });
  }

  // Update webhook last triggered
  await db.update(webhooks)
    .set({ lastTriggeredAt: new Date() })
    .where(eq(webhooks.id, webhook.id));

  const files = await getRepoFiles(repo.fullName, dbUser.githubToken);
  const filesContext = files.map((f: any) => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');

  let currentCredits = dbUser.credits;
  const startTime = Date.now();
  const shareToken = crypto.randomUUID();

  const [testRun] = await db.insert(testRuns).values({
    repoId: repo.id,
    userId: dbUser.id,
    status: 'running',
    totalTests: targetTests.length,
    triggeredBy: 'webhook',
    shareToken: shareToken,
  }).returning();

  let passed = 0;
  let failed = 0;
  const rcaPromises: Promise<void>[] = [];
  const results = [];

  for (const tc of targetTests) {
    await db.update(testCases).set({ status: 'running', runId: testRun.id }).where(eq(testCases.id, tc.id));

    // 1. Generate Script
    const prompt = `
You are an expert Playwright automation engineer.
We need to run the following test case:
Title: ${tc.title}
Description: ${tc.description}
Target Route: ${tc.targetRoute}
Expected Result: ${tc.expectedResult}
Global Instruction: ${repo.globalInstruction || 'None'}
Known issues to be aware of: ${repo.knownIssues || 'None'}
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
      await db.update(testCases).set({ status: 'fail', logs: ['Failed to generate script'], runId: testRun.id }).where(eq(testCases.id, tc.id));
      failed++;
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
        script: script,
        sessionId: session.id,
        sessionUrl: `https://browserbase.com/sessions/${session.id}`,
        runId: testRun.id
      }).where(eq(testCases.id, tc.id));
      passed++;

    } catch (err: any) {
      logs.push(`[execution error] ${err.message}`);
      await db.update(testCases).set({ 
        status: 'fail', 
        logs: logs,
        script: script,
        sessionId: session?.id,
        sessionUrl: session ? `https://browserbase.com/sessions/${session.id}` : null,
        runId: testRun.id
      }).where(eq(testCases.id, tc.id));
      failed++;
      rcaPromises.push(performRCA(tc, testRun.id, repo, dbUser, filesContext, logs, script));
    } finally {
      if (browser) await browser.close();
    }

    // Deduct 10 credits
    currentCredits -= 10;
    await db.update(users).set({ credits: currentCredits }).where(eq(users.id, dbUser.id));

    results.push({ id: tc.id, status: 'complete' });
  }

  await db.update(testRuns).set({
    status: 'complete',
    passed: passed,
    failed: failed,
    durationMs: Date.now() - startTime
  }).where(eq(testRuns.id, testRun.id));

  await Promise.allSettled(rcaPromises);

  const reqUrl = new URL(req.url);
  const shareUrl = `${reqUrl.origin}/report/${shareToken}`;

  const fetchedSettings = await db.query.notificationSettings.findFirst({
    where: (s, { eq }) => eq(s.userId, dbUser.id)
  });

  await sendRunNotifications({
    userEmail: dbUser.email,
    settings: fetchedSettings,
    repoName: repo.fullName,
    passed,
    failed,
    shareUrl,
    triggeredBy: 'webhook'
  });

  return NextResponse.json({ 
    success: true, 
    runId: testRun.id, 
    passed, 
    failed, 
    status: 'complete', 
    shareUrl 
  });
}
