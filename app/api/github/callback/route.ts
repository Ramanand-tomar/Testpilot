import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { userId: currentAuthUserId } = await auth();
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');

  if (!code || !stateParam) {
    return new Response('Missing code or state', { status: 400 });
  }

  const [stateUserId, nonce] = stateParam.split(':');
  if (!stateUserId || !nonce) {
    return new Response('Invalid state format', { status: 400 });
  }

  // Verify state user matches current logged in Clerk user
  if (currentAuthUserId && currentAuthUserId !== stateUserId) {
    return new Response('State user mismatch (CSRF warning)', { status: 403 });
  }

  // Verify nonce cookie
  const cookieStore = await cookies();
  const savedNonce = cookieStore.get('github_oauth_nonce')?.value;
  cookieStore.delete('github_oauth_nonce');

  if (!savedNonce || savedNonce !== nonce) {
    return new Response('Invalid or expired OAuth state nonce', { status: 403 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(stateUserId);
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
