import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { repositories, testCases, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ repoId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  if (!dbUser) return new Response('User not found', { status: 404 });

  const resolvedParams = await params;
  const repoId = parseInt(resolvedParams.repoId);
  if (isNaN(repoId)) return new Response('Invalid repository ID', { status: 400 });

  const repo = await db.query.repositories.findFirst({
    where: and(eq(repositories.id, repoId), eq(repositories.userId, dbUser.id))
  });

  if (!repo) return new Response('Repository not found or access denied', { status: 404 });

  const tests = await db.query.testCases.findMany({
    where: eq(testCases.repoId, repoId),
    orderBy: (testCases, { desc }) => [desc(testCases.createdAt)]
  });

  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;
  const pending = tests.filter(t => t.status === 'pending' || t.status === 'running').length;

  let markdown = '# Test Report: ' + repo.fullName + '\n\n';
  markdown += '## Repository Details\n';
  markdown += '- **Branch**: ' + (repo.defaultBranch || 'main') + '\n';
  markdown += '- **Language**: ' + (repo.language || 'Unknown') + '\n';
  markdown += '- **Target Domain**: ' + (repo.targetDomain || 'N/A') + '\n\n';
  
  markdown += '## Execution Summary\n';
  markdown += '- **Total Tests**: ' + tests.length + '\n';
  markdown += '- **Passed**: ' + passed + '\n';
  markdown += '- **Failed**: ' + failed + '\n';
  markdown += '- **Pending/Running**: ' + pending + '\n\n';

  if (tests.length > 0) {
    markdown += '## Test Cases Details\n\n';
    tests.forEach((t, i) => {
      markdown += '### ' + (i + 1) + '. ' + t.title + '\n';
      markdown += '- **Status**: ' + (t.status ? t.status.toUpperCase() : 'UNKNOWN') + '\n';
      markdown += '- **Route**: ' + t.targetRoute + '\n';
      if (t.description) markdown += '- **Description**: ' + t.description + '\n';
      if (t.expectedResult) markdown += '- **Expected**: ' + t.expectedResult + '\n';
      
      if (t.logs) {
        markdown += '\n**Logs / Output**:\n`	ext\n' + JSON.stringify(t.logs, null, 2) + '\n`\n';
      }
      markdown += '\n---\n\n';
    });
  } else {
    markdown += '*No test cases generated yet.*\n';
  }

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown'
    }
  });
}
