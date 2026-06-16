import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { testRuns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const resolvedParams = await params;
  const runId = parseInt(resolvedParams.runId);
  if (isNaN(runId)) return new Response('Invalid runId', { status: 400 });

  const run = await db.query.testRuns.findFirst({
    where: eq(testRuns.id, runId),
    with: {
      testCases: true
    }
  });

  if (!run) return new Response('Run not found', { status: 404 });

  return NextResponse.json(run);
}
