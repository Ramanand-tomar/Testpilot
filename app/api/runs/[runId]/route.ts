import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { testRuns, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: 'User email not found' }, { status: 400 });

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const resolvedParams = await params;
    const runId = parseInt(resolvedParams.runId);
    if (isNaN(runId)) return NextResponse.json({ error: 'Invalid runId' }, { status: 400 });

    const run = await db.query.testRuns.findFirst({
      where: and(eq(testRuns.id, runId), eq(testRuns.userId, dbUser.id)),
      with: {
        testCases: true
      }
    });

    if (!run) return NextResponse.json({ error: 'Run not found or access denied' }, { status: 404 });

    return NextResponse.json(run);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
