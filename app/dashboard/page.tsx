import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { repositories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import DashboardClient from './dashboard-client';
import { getOrCreateUser } from '@/lib/user-helper';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) redirect('/sign-in');

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
  const dbUser = await getOrCreateUser(email, name);

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
