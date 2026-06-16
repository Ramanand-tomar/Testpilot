import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { webhooks, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ webhookId: string }> }
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) return new Response('User not found', { status: 404 });

  const resolvedParams = await params;
  const webhookId = parseInt(resolvedParams.webhookId);
  if (isNaN(webhookId)) return new Response('Invalid webhook ID', { status: 400 });

  await db.delete(webhooks).where(
    and(
      eq(webhooks.id, webhookId),
      eq(webhooks.userId, dbUser.id)
    )
  );

  return NextResponse.json({ success: true });
}
