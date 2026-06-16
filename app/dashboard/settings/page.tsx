import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) redirect('/sign-in');

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) redirect('/sign-in');

  let githubUsername: string | null = null;

  if (dbUser.githubToken) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${dbUser.githubToken}`,
          'User-Agent': 'AI-Testing-Automation-Agent',
        },
        // Avoid caching stale tokens
        cache: 'no-store',
      });
      if (response.ok) {
        const githubData = await response.json();
        githubUsername = githubData.login || null;
      }
    } catch (err) {
      console.error('Failed to retrieve connected GitHub handle:', err);
    }
  }

  return (
    <SettingsClient 
      dbUser={{
        name: dbUser.name || '',
        email: dbUser.email,
        githubConnected: !!dbUser.githubToken,
      }}
      githubUsername={githubUsername}
    />
  );
}
