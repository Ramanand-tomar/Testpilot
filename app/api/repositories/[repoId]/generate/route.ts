import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, repositories, testCases } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getRepoFiles } from '@/lib/github';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const resolvedParams = await params;
  const repoId = parseInt(resolvedParams.repoId);
  if (isNaN(repoId)) return new Response('Invalid repository ID', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser || !dbUser.githubToken) {
    return new Response('User or GitHub token not found', { status: 404 });
  }

  if (dbUser.credits < 50) {
    return new Response('Insufficient credits', { status: 402 });
  }

  const repo = await db.query.repositories.findFirst({
    where: and(eq(repositories.id, repoId), eq(repositories.userId, dbUser.id))
  });

  if (!repo) {
    return new Response('Repository not found or access denied', { status: 404 });
  }

  const files = await getRepoFiles(repo.fullName, dbUser.githubToken);

  const filesContext = files.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');
  const prompt = `
You are a senior QA Automation Engineer.
Based on the following repository files, generate 5-10 test cases.
Global Instruction from user: ${repo.globalInstruction || 'None'}
Known issues to be aware of: ${repo.knownIssues || 'None'}

${filesContext}

Output the test cases as a JSON array exactly matching this structure (no markdown fences, just pure JSON):
[
  {
    "title": "Test case title",
    "description": "Detailed description",
    "type": "UI" | "API" | "Authentication" | "Navigation" | "Form",
    "target_route": "/api/test or /dashboard",
    "expected_result": "What should happen",
    "priority": "high" | "medium" | "low",
    "tags": ["auth", "critical", "api"]
  }
]
`;

  let responseText = '';
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
    const result = await model.generateContent(prompt);
    responseText = result.response.text();
  } catch (error: any) {
    console.error('Gemini API Error:', error.message || error);
    return new Response('AI Provider Error: ' + (error.message || 'Service Unavailable'), { status: 503 });
  }

  if (responseText.startsWith('```json')) {
    responseText = responseText.replace(/^```json/, '').replace(/```$/, '');
  } else if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```/, '').replace(/```$/, '');
  }

  let generatedTests;
  try {
    generatedTests = JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Failed to parse Gemini response', responseText);
    return new Response('Failed to generate test cases', { status: 500 });
  }

  const insertedTests = await Promise.all(
    generatedTests.map(async (tc: any) => {
      const [newTc] = await db.insert(testCases).values({
        repoId: repo.id,
        title: tc.title,
        description: tc.description,
        type: tc.type,
        targetRoute: tc.target_route,
        expectedResult: tc.expected_result,
        priority: tc.priority || 'medium',
        tags: tc.tags || [],
        status: 'pending',
      }).returning();
      return newTc;
    })
  );

  await db.update(users)
    .set({ credits: dbUser.credits - 50 })
    .where(eq(users.id, dbUser.id));

  return NextResponse.json(insertedTests);
}
