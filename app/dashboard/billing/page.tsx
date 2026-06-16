import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import BillingClient from './billing-client';

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) redirect('/sign-in');

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!dbUser) redirect('/sign-in');

  let renewalDate = 'N/A';
  let price = '$0.00';

  if (dbUser.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId) as any;
      renewalDate = new Date(sub.current_period_end * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const amount = sub.items.data[0]?.price?.unit_amount;
      const currency = sub.items.data[0]?.price?.currency || 'usd';
      if (amount !== undefined && amount !== null) {
        price = (amount / 100).toLocaleString('en-US', {
          style: 'currency',
          currency: currency.toUpperCase(),
        });
      }
    } catch (err) {
      console.error('Failed to retrieve subscription details:', err);
    }
  }

  return (
    <BillingClient 
      dbUser={{
        plan: dbUser.plan,
        credits: dbUser.credits,
        stripeCustomerId: dbUser.stripeCustomerId,
      }}
      renewalDate={renewalDate}
      price={price}
    />
  );
}
