import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) {
      return new Response('User email not found', { status: 400 });
    }

    await db.update(users)
      .set({ githubToken: null })
      .where(eq(users.email, email));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting GitHub:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
