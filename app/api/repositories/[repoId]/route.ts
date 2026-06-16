import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { repositories, testCases } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const resolvedParams = await params;
  const repoId = parseInt(resolvedParams.repoId);
  if (isNaN(repoId)) return new Response('Invalid repository ID', { status: 400 });

  const body = await req.json();
  const { target_domain, global_instruction } = body;

  const updated = await db.update(repositories)
    .set({
      ...(target_domain !== undefined && { targetDomain: target_domain }),
      ...(global_instruction !== undefined && { globalInstruction: global_instruction })
    })
    .where(eq(repositories.id, repoId))
    .returning();

  if (updated.length === 0) {
    return new Response('Repository not found or access denied', { status: 404 });
  }

  return NextResponse.json(updated[0]);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const resolvedParams = await params;
  const repoId = parseInt(resolvedParams.repoId);
  if (isNaN(repoId)) return new Response('Invalid repository ID', { status: 400 });

  // First, delete associated test cases to respect foreign keys, or ensure cascade
  await db.delete(testCases).where(eq(testCases.repoId, repoId));
  const deleted = await db.delete(repositories).where(eq(repositories.id, repoId)).returning();

  if (deleted.length === 0) {
    return new Response('Repository not found or access denied', { status: 404 });
  }

  return NextResponse.json({ success: true });
}
