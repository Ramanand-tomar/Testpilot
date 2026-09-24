import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) {
      return new Response("User email not found", { status: 400 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!dbUser) {
      return new Response("User not found", { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { plan, priceId } = body || {};

    let targetPriceId = priceId;
    if (plan === "pro") {
      targetPriceId = process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    } else if (plan === "team") {
      targetPriceId = process.env.STRIPE_TEAM_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID;
    }

    if (!targetPriceId || targetPriceId.includes("placeholder")) {
      return NextResponse.json({ error: "Stripe price ID is not configured on server" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
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
