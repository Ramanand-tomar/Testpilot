import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type GitHubRepo = {
  id: number;
  full_name: string;
  default_branch: string;
  private: boolean;
  language: string;
  description: string;
  html_url: string;
  fork: boolean;
};

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser?.githubToken) {
    return new Response('GitHub token not found. Please connect GitHub.', { status: 400 });
  }

  const reposRes = await fetch('https://api.github.com/user/repos?visibility=all&sort=updated&direction=desc&per_page=100', {
    headers: {
      Authorization: `Bearer ${dbUser.githubToken}`,
      Accept: 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
  });

  if (!reposRes.ok) {
    return new Response('Failed to fetch from GitHub', { status: reposRes.status });
  }

  const allRepos: GitHubRepo[] = await reposRes.json();
  
  const mappedRepos = allRepos
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      id: repo.id,
      full_name: repo.full_name,
      default_branch: repo.default_branch,
      private: repo.private,
      language: repo.language,
      description: repo.description,
      html_url: repo.html_url
    }));

  return NextResponse.json(mappedRepos);
}
