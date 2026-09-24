import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, notificationSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { emailEnabled, slackWebhookUrl, notifyOn } = body || {};

    if (slackWebhookUrl && typeof slackWebhookUrl === 'string') {
      const url = slackWebhookUrl.trim();
      if (url && !url.startsWith('https://hooks.slack.com/')) {
        return NextResponse.json({ error: 'Slack webhook URL must start with https://hooks.slack.com/' }, { status: 400 });
      }
    }

    const existing = await db.query.notificationSettings.findFirst({
      where: eq(notificationSettings.userId, dbUser.id)
    });

    if (existing) {
      const [updated] = await db.update(notificationSettings).set({
        emailEnabled: emailEnabled !== undefined ? Boolean(emailEnabled) : existing.emailEnabled,
        slackWebhookUrl: slackWebhookUrl !== undefined ? slackWebhookUrl : existing.slackWebhookUrl,
        notifyOn: notifyOn !== undefined ? notifyOn : existing.notifyOn
      }).where(eq(notificationSettings.id, existing.id)).returning();
      return NextResponse.json(updated);
    } else {
      const [created] = await db.insert(notificationSettings).values({
        userId: dbUser.id,
        emailEnabled: emailEnabled !== undefined ? Boolean(emailEnabled) : true,
        slackWebhookUrl: slackWebhookUrl || null,
        notifyOn: notifyOn || 'all'
      }).returning();
      return NextResponse.json(created);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
