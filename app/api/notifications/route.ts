import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, notificationSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) return new Response('User not found', { status: 404 });

  let settings = await db.query.notificationSettings.findFirst({
    where: eq(notificationSettings.userId, dbUser.id)
  });

  if (!settings) {
    const [newSettings] = await db.insert(notificationSettings).values({
      userId: dbUser.id,
      emailEnabled: true,
      notifyOn: 'all'
    }).returning();
    settings = newSettings;
  }

  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) return new Response('User not found', { status: 404 });

  const body = await req.json();
  const { emailEnabled, slackWebhookUrl, notifyOn } = body;

  const existing = await db.query.notificationSettings.findFirst({
    where: eq(notificationSettings.userId, dbUser.id)
  });

  if (existing) {
    const [updated] = await db.update(notificationSettings).set({
      emailEnabled: emailEnabled !== undefined ? emailEnabled : existing.emailEnabled,
      slackWebhookUrl: slackWebhookUrl !== undefined ? slackWebhookUrl : existing.slackWebhookUrl,
      notifyOn: notifyOn !== undefined ? notifyOn : existing.notifyOn
    }).where(eq(notificationSettings.id, existing.id)).returning();
    return NextResponse.json(updated);
  } else {
    const [created] = await db.insert(notificationSettings).values({
      userId: dbUser.id,
      emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
      slackWebhookUrl: slackWebhookUrl || null,
      notifyOn: notifyOn || 'all'
    }).returning();
    return NextResponse.json(created);
  }
}
