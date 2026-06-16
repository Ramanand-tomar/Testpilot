import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { repositories, users, testCases } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) {
    return new Response('Database user not found', { status: 404 });
  }

  const body = await req.json();
  const { repo_id, full_name, html_url, description, language, default_branch, target_domain, global_instruction } = body;

  if (!repo_id || !full_name) {
    return new Response('Missing required fields', { status: 400 });
  }

  const newRepo = await db.insert(repositories).values({
    userId: dbUser.id,
    repoId: String(repo_id),
    fullName: full_name,
    htmlUrl: html_url,
    description: description,
    language: language,
    defaultBranch: default_branch,
    targetDomain: target_domain,
    globalInstruction: global_instruction,
  }).returning();

  return NextResponse.json(newRepo[0]);
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) return new Response('User email not found', { status: 400 });

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) {
    return new Response('Database user not found', { status: 404 });
  }

  const userRepos = await db.query.repositories.findMany({
    where: eq(repositories.userId, dbUser.id),
    with: {
      testCases: true,
      schedules: true,
    },
  });

  return NextResponse.json(userRepos);
}
