import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const userIdStr = session.client_reference_id || session.metadata?.userId;
      
      if (!userIdStr) {
        console.error('No user ID found in checkout session metadata or reference ID');
        break;
      }
      
      const userId = parseInt(userIdStr);
      if (isNaN(userId)) {
        console.error('Invalid user ID in session:', userIdStr);
        break;
      }

      const subscriptionId = session.subscription as string;
      let plan = 'Free';
      let addedCredits = 0;

      if (subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            plan = 'Pro';
            addedCredits = 10000;
          } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
            plan = 'Team';
            addedCredits = 50000;
          }
        } catch (subErr) {
          console.error('Failed to retrieve subscription details:', subErr);
        }
      }

      await db.update(users)
        .set({ 
          plan: plan, 
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          credits: sql`${users.credits} + ${addedCredits}`
        })
        .where(eq(users.id, userId));

      console.log(`Successfully upgraded User ID ${userId} to plan ${plan} with +${addedCredits} credits.`);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await db.update(users)
        .set({ 
          plan: 'Free',
          stripeSubscriptionId: null,
        })
        .where(eq(users.stripeCustomerId, customerId));

      console.log(`Subscription deleted for customer ${customerId}. Reset user plan to Free.`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
