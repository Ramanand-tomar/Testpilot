import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { repositories, testCases, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  if (!dbUser) return new Response('User profile not found', { status: 404 });

  const resolvedParams = await params;
  const repoId = parseInt(resolvedParams.repoId);
  if (isNaN(repoId)) return new Response('Invalid repository ID', { status: 400 });

  const body = await req.json();
  const { target_domain, global_instruction, known_issues } = body;

  const updated = await db.update(repositories)
    .set({
      ...(target_domain !== undefined && { targetDomain: target_domain }),
      ...(global_instruction !== undefined && { globalInstruction: global_instruction }),
      ...(known_issues !== undefined && { knownIssues: known_issues })
    })
    .where(and(eq(repositories.id, repoId), eq(repositories.userId, dbUser.id)))
    .returning();

  if (updated.length === 0) {
    return new Response('Repository not found or access denied', { status: 404 });
  }

  return NextResponse.json(updated[0]);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  if (!dbUser) return new Response('User profile not found', { status: 404 });

  const resolvedParams = await params;
  const repoId = parseInt(resolvedParams.repoId);
  if (isNaN(repoId)) return new Response('Invalid repository ID', { status: 400 });

  // Verify the repository belongs to the current user before deleting
  const repo = await db.query.repositories.findFirst({
    where: and(eq(repositories.id, repoId), eq(repositories.userId, dbUser.id))
  });

  if (!repo) {
    return new Response('Repository not found or access denied', { status: 404 });
  }

  // First, delete associated test cases to respect foreign keys, or ensure cascade
  await db.delete(testCases).where(eq(testCases.repoId, repoId));
  await db.delete(repositories).where(eq(repositories.id, repoId));

  return NextResponse.json({ success: true });
}
