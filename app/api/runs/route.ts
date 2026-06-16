import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { testRuns } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const repoIdParam = url.searchParams.get('repoId');
  if (!repoIdParam) return new Response('Missing repoId', { status: 400 });

  const repoId = parseInt(repoIdParam);
  if (isNaN(repoId)) return new Response('Invalid repoId', { status: 400 });

  const runs = await db.query.testRuns.findMany({
    where: eq(testRuns.repoId, repoId),
    orderBy: [desc(testRuns.createdAt)]
  });

  return NextResponse.json(runs);
}
