import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users, repositories, testCases } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) return new Response('Database user not found', { status: 404 });

  return NextResponse.json({ 
    credits: dbUser.credits, 
    githubConnected: !!dbUser.githubToken,
    name: dbUser.name,
    email: dbUser.email,
    plan: dbUser.plan
  });
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) return new Response('User email not found', { status: 400 });

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    if (!dbUser) return new Response('Database user not found', { status: 404 });

    const { name } = await req.json();
    if (name === undefined) {
      return new Response('Missing name parameter', { status: 400 });
    }

    const [updatedUser] = await db
      .update(users)
      .set({ name })
      .where(eq(users.id, dbUser.id))
      .returning();

    return NextResponse.json({
      credits: updatedUser.credits,
      githubConnected: !!updatedUser.githubToken,
      name: updatedUser.name,
      email: updatedUser.email,
      plan: updatedUser.plan
    });
  } catch (err: any) {
    console.error('User profile update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) return new Response('User email not found', { status: 400 });

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    if (!dbUser) return new Response('Database user not found', { status: 404 });

    // 1. Fetch user's repositories
    const userRepos = await db
      .select({ id: repositories.id })
      .from(repositories)
      .where(eq(repositories.userId, dbUser.id));

    const repoIds = userRepos.map((r) => r.id);

    // 2. Delete test cases belonging to user's repositories
    if (repoIds.length > 0) {
      await db.delete(testCases).where(inArray(testCases.repoId, repoIds));
    }

    // 3. Delete repositories
    await db.delete(repositories).where(eq(repositories.userId, dbUser.id));

    // 4. Delete the user row
    await db.delete(users).where(eq(users.id, dbUser.id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Account deletion error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
