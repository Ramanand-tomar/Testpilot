import { db } from '@/db';
import { testRuns, testCases, repositories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const resolvedParams = await params;
  const { shareToken } = resolvedParams;

  if (!shareToken) return new Response('Missing token', { status: 400 });

  const run = await db.query.testRuns.findFirst({
    where: eq(testRuns.shareToken, shareToken),
    with: {
      repository: true,
      testCases: true
    }
  });

  if (!run) return new Response('Report not found', { status: 404 });

  return NextResponse.json(run);
}
