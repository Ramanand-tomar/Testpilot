import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
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

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!dbUser || !dbUser.stripeCustomerId) {
      return new Response('Stripe customer profile not found. Please subscribe to a plan first.', { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Portal session creation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
