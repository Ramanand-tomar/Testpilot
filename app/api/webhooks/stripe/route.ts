import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';

const processedEvents = new Set<string>();

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

  if (processedEvents.has(event.id)) {
    return NextResponse.json({ received: true, deduplicated: true });
  }
  processedEvents.add(event.id);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const userIdStr = session.client_reference_id || session.metadata?.userId;
      
      if (!userIdStr) break;
      const userId = parseInt(userIdStr);
      if (isNaN(userId)) break;

      const subscriptionId = session.subscription as string;
      let plan = 'Free';
      let addedCredits = 0;

      if (subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          if (priceId === process.env.STRIPE_PRO_PRICE_ID || priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
            plan = 'Pro';
            addedCredits = 10000;
          } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID || priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID) {
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
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const billingReason = invoice.billing_reason;

      if (billingReason === 'subscription_cycle') {
        const subscriptionId = ((invoice as any).subscription || (invoice.lines?.data && (invoice.lines.data[0] as any)?.subscription)) as string;
        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;
            let refillCredits = 0;

            if (priceId === process.env.STRIPE_PRO_PRICE_ID || priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
              refillCredits = 10000;
            } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID || priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID) {
              refillCredits = 50000;
            }

            if (refillCredits > 0) {
              await db.update(users)
                .set({ credits: sql`${users.credits} + ${refillCredits}` })
                .where(eq(users.stripeCustomerId, customerId));
            }
          } catch (err) {
            console.error('Invoice renewal refill error:', err);
          }
        }
      }
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
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
