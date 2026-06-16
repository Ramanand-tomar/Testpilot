import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, schedules } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ scheduleId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) return new Response('User not found', { status: 404 });

  const resolvedParams = await params;
  const scheduleId = parseInt(resolvedParams.scheduleId);
  if (isNaN(scheduleId)) return new Response('Invalid schedule ID', { status: 400 });

  const schedule = await db.query.schedules.findFirst({
    where: and(eq(schedules.id, scheduleId), eq(schedules.userId, dbUser.id))
  });

  if (!schedule) {
    return new Response('Schedule not found', { status: 404 });
  }

  await db.delete(schedules).where(eq(schedules.id, schedule.id));

  return NextResponse.json({ success: true });
}
