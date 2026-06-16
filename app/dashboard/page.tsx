import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users, repositories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) redirect('/sign-in');

  let dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) {
    const [newUser] = await db.insert(users).values({
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
      email: email,
      credits: 1000,
    }).returning();
    dbUser = newUser;
  }

  const userRepos = await db.query.repositories.findMany({
    where: eq(repositories.userId, dbUser.id),
    with: {
      testCases: true,
    },
  });

  return (
    <DashboardClient 
      initialRepos={userRepos} 
      credits={dbUser.credits} 
      githubConnected={!!dbUser.githubToken} 
      plan={dbUser.plan}
    />
  );
}
