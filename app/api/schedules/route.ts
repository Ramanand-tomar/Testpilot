import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, repositories, schedules } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { parseExpression } from 'cron-parser';

export async function POST(req: Request) {
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
  const { repoId, cronExpression, isActive } = body;

  if (!repoId || !cronExpression) {
    return new Response('Missing repoId or cronExpression', { status: 400 });
  }

  const repo = await db.query.repositories.findFirst({
    where: and(eq(repositories.id, repoId), eq(repositories.userId, dbUser.id))
  });

  if (!repo) {
    return new Response('Repository not found or access denied', { status: 404 });
  }

  let nextRunAt = null;
  if (isActive !== false) {
    try {
      const interval = parseExpression(cronExpression);
      nextRunAt = interval.next().toDate();
    } catch (err) {
      return new Response('Invalid cron expression', { status: 400 });
    }
  }

  // Check if schedule already exists
  const existing = await db.query.schedules.findFirst({
    where: and(eq(schedules.repoId, repo.id), eq(schedules.userId, dbUser.id))
  });

  if (existing) {
    const [updated] = await db.update(schedules).set({
      cronExpression,
      isActive: isActive !== false,
      nextRunAt
    }).where(eq(schedules.id, existing.id)).returning();
    return NextResponse.json(updated);
  } else {
    const [created] = await db.insert(schedules).values({
      repoId: repo.id,
      userId: dbUser.id,
      cronExpression,
      isActive: isActive !== false,
      nextRunAt
    }).returning();
    return NextResponse.json(created);
  }
}
