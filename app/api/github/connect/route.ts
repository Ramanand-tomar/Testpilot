import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return new Response('GitHub OAuth not configured', { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo read:user',
    state: userId,
  });

  redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
