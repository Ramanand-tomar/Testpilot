import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { testCases, repositories, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ testId: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const resolvedParams = await params;
  const testId = parseInt(resolvedParams.testId);
  if (isNaN(testId)) return new Response('Invalid test ID', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) return new Response('Database user not found', { status: 404 });

  const targetTestCase = await db.select({
      testCase: testCases,
      repository: repositories
    })
    .from(testCases)
    .innerJoin(repositories, eq(testCases.repoId, repositories.id))
    .where(and(eq(testCases.id, testId), eq(repositories.userId, dbUser.id)))
    .limit(1);

  if (targetTestCase.length === 0) {
    return new Response('Test case not found or access denied', { status: 404 });
  }

  const body = await req.json();
  const { title, description, target_route, expected_result } = body;

  const updated = await db.update(testCases)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(target_route !== undefined && { targetRoute: target_route }),
      ...(expected_result !== undefined && { expectedResult: expected_result }),
    })
    .where(eq(testCases.id, testId))
    .returning();

  return NextResponse.json(updated[0]);
}
