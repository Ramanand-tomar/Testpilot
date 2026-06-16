import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const clerkUserId = url.searchParams.get('state');

  if (!code || !clerkUserId) {
    return new Response('Missing code or state', { status: 400 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) {
    return new Response('User email not found', { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.access_token) {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
    
    const updated = await db.update(users)
      .set({ githubToken: tokenData.access_token })
      .where(eq(users.email, email))
      .returning();

    if (updated.length === 0) {
      await db.insert(users).values({ 
        email, 
        name, 
        credits: 1000, 
        githubToken: tokenData.access_token 
      }).onConflictDoUpdate({ 
        target: users.email, 
        set: { githubToken: tokenData.access_token } 
      });
    }

    redirect('/dashboard?github=connected');
  } else {
    console.error('GitHub token error:', tokenData);
    redirect('/dashboard?github=error');
  }
}
