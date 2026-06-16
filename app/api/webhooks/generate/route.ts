import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { webhooks, repositories, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) return new Response('User not found', { status: 404 });

  const body = await req.json();
  const { repoId } = body;
  
  if (!repoId) return new Response('Missing repoId', { status: 400 });

  // Verify ownership
  const repo = await db.query.repositories.findFirst({
    where: eq(repositories.id, repoId)
  });

  if (!repo || repo.userId !== dbUser.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check if webhook already exists
  const existing = await db.query.webhooks.findFirst({
    where: eq(webhooks.repoId, repoId)
  });

  if (existing) {
    return NextResponse.json({ webhook: existing });
  }

  const secret = crypto.randomUUID();

  const [newWebhook] = await db.insert(webhooks).values({
    repoId,
    userId: dbUser.id,
    secret,
  }).returning();

  return NextResponse.json({ webhook: newWebhook });
}
