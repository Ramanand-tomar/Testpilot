"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PricingSection from '@/components/pricing-section';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-indigo-500/30 pb-20">
      {/* Header Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-zinc-800/50">
        <Link href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-bold text-xl tracking-tight">Testpilot</span>
        </div>
      </nav>

      {/* Pricing Hero */}
      <section className="py-16 px-8 max-w-5xl mx-auto text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
          Scale your automated test coverage with AI QA runners. Cancel or upgrade anytime.
        </p>
      </section>

      {/* Plans Grid */}
      <section className="px-8 max-w-6xl mx-auto">
        <PricingSection />
      </section>
    </main>
  );
}
