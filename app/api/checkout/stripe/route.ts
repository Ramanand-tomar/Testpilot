import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    let dbUser;

    if (!userId) {
      if (process.env.NODE_ENV !== "production") {
        dbUser = await db.query.users.findFirst({
          where: eq(users.email, "testuser@example.com")
        });
        if (!dbUser) {
          const [newUser] = await db.insert(users).values({
            name: "Test User",
            email: "testuser@example.com",
            credits: 1000,
            plan: "Free",
          }).returning();
          dbUser = newUser;
        }
      } else {
        return new Response("Unauthorized", { status: 401 });
      }
    } else {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress;
      if (!email) {
        return new Response("User email not found", { status: 400 });
      }
      dbUser = await db.query.users.findFirst({
        where: eq(users.email, email)
      });
      if (!dbUser) {
        const [newUser] = await db.insert(users).values({
          name: clerkUser?.firstName || "User",
          email: email,
          credits: 1000,
          plan: "Free",
        }).returning();
        dbUser = newUser;
      }
    }

    const body = await req.json().catch(() => ({}));
    const { plan, priceId } = body || {};

    let targetPriceId = priceId;
    if (!targetPriceId || targetPriceId.includes("placeholder") || plan === "pro") {
      targetPriceId = process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    } else if (plan === "team") {
      targetPriceId = process.env.STRIPE_TEAM_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID;
    }

    if (!targetPriceId || targetPriceId.includes("placeholder")) {
      return NextResponse.json({ error: "Stripe price ID is not configured on server" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      managed_payments: { enabled: false },
      customer: dbUser.stripeCustomerId || undefined,
      customer_email: dbUser.stripeCustomerId ? undefined : dbUser.email,
      client_reference_id: dbUser.id.toString(),
      line_items: [
        {
          price: targetPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: baseUrl + "/dashboard?success=true",
      cancel_url: baseUrl + "/dashboard?canceled=true",
      metadata: {
        userId: dbUser.id.toString(),
      }
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
