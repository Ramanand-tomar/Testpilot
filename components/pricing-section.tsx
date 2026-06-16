"use client";

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, Loader2, Zap } from 'lucide-react';

export default function PricingSection() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Ideal for trying out AI-driven testing and small projects.",
      features: [
        "100 monthly credits",
        "1 active repository connection",
        "Standard AI script generation",
        "Basic test execution logs",
      ],
      buttonText: "Start Free",
      action: () => router.push(isSignedIn ? "/dashboard" : "/sign-up"),
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "Perfect for active developers and professional projects.",
      features: [
        "2,000 monthly credits",
        "Up to 5 active repositories",
        "Interactive video session recordings",
        "Playwright script viewer & editor",
        "Agent detailed execution logs",
        "Priority test run queues"
      ],
      buttonText: "Upgrade to Pro",
      action: () => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_1QPRO_placeholder", "Pro"),
      popular: true,
    },
    {
      name: "Team",
      price: "$99",
      period: "/month",
      description: "Best for collaborative teams requiring massive QA scale.",
      features: [
        "10,000 monthly credits",
        "Unlimited repositories",
        "Everything in Pro plan",
        "Advanced Agent instruction customization",
        "High-performance browser session replays",
        "Collaborative workspace (Coming Soon)",
        "Priority 24/7 dedicated support"
      ],
      buttonText: "Upgrade to Team",
      action: () => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID || "price_1QTEAM_placeholder", "Team"),
      popular: false,
    }
  ];

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/pricing`);
      return;
    }

    setLoadingPlan(planName);
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        throw new Error('Failed to create stripe checkout session');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No Checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during Stripe redirection. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 items-stretch">
      {plans.map((plan) => (
        <div 
          key={plan.name}
          className={`flex flex-col justify-between bg-[#0d0d0f] border rounded-2xl p-8 transition-all duration-200 relative ${
            plan.popular 
              ? 'border-indigo-500/80 shadow-[0_0_24px_-4px_rgba(99,102,241,0.15)] bg-zinc-900/60' 
              : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          {plan.popular && (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow flex items-center gap-1">
              <Zap className="w-3 h-3 fill-white" /> Most Popular
            </span>
          )}

          <div>
            <h3 className="text-xl font-bold text-zinc-100">{plan.name}</h3>
            <p className="text-sm text-zinc-400 mt-2 min-h-[40px] leading-relaxed">{plan.description}</p>
            
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-zinc-50">{plan.price}</span>
              {plan.period && <span className="text-zinc-500 text-sm font-medium">{plan.period}</span>}
            </div>

            <div className="h-px bg-zinc-800 my-6" />

            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300 leading-normal">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={() => plan.action()}
              disabled={loadingPlan !== null}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow ${
                plan.popular
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
              } disabled:opacity-50`}
            >
              {loadingPlan === plan.name && <Loader2 className="w-4 h-4 animate-spin" />}
              {plan.buttonText}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
