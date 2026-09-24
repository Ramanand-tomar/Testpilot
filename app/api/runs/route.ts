import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { testRuns, repositories, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const repoIdParam = url.searchParams.get('repoId');
    if (!repoIdParam) return NextResponse.json({ error: 'Missing repoId' }, { status: 400 });

    const repoId = parseInt(repoIdParam);
    if (isNaN(repoId)) return NextResponse.json({ error: 'Invalid repoId' }, { status: 400 });

    const repo = await db.query.repositories.findFirst({
      where: and(eq(repositories.id, repoId), eq(repositories.userId, dbUser.id))
    });
    if (!repo) return NextResponse.json({ error: 'Repository not found or access denied' }, { status: 404 });

    const runs = await db.query.testRuns.findMany({
      where: and(eq(testRuns.repoId, repoId), eq(testRuns.userId, dbUser.id)),
      orderBy: [desc(testRuns.createdAt)]
    });

    return NextResponse.json(runs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
