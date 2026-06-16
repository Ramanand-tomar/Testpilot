import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function GET() {
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
      return NextResponse.json([]);
    }

    const invoices = await stripe.invoices.list({
      customer: dbUser.stripeCustomerId,
      limit: 10,
    });

    const history = invoices.data.map((invoice) => {
      const date = new Date(invoice.created * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const description = invoice.lines.data[0]?.description || 'Stripe Subscription Payment';
      const amount = (invoice.total / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: invoice.currency.toUpperCase(),
      });
      const status = invoice.status === 'paid' ? 'Paid' : 'Failed';

      return {
        date,
        description,
        amount,
        status,
      };
    });

    return NextResponse.json(history);
  } catch (err: any) {
    console.error('Invoice history fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
