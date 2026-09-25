"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle2, Sparkles, Shield, GitBranch, Terminal, ExternalLink } from "lucide-react";
import PricingSection from "@/components/pricing-section";
import DemoVideoModal from "@/components/modals/demo-video-modal";
import DocsModal from "@/components/modals/docs-modal";
import LegalModal from "@/components/modals/legal-modal";

export default function Home() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 border-b border-[#1f1f23] bg-[#09090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm shadow-md shadow-indigo-500/20">
            ⚡
          </div>
          <span className="text-indigo-400 font-extrabold tracking-tight">Testpilot</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-zinc-100 transition">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-100 transition">How It Works</a>
          <a href="#pricing" className="hover:text-zinc-100 transition">Pricing</a>
          <button 
            onClick={() => setIsDocsOpen(true)}
            className="hover:text-zinc-100 transition cursor-pointer"
          >
            Docs
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 hidden md:block transition">
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-6 pt-24 pb-16 md:pt-32 md:pb-20 max-w-4xl mx-auto relative">
        <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/90 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-8 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
          AI-Powered Autonomous Quality Assurance
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-500 bg-clip-text text-transparent mb-6">
          Your AI QA Engineer,<br />Always On.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
          Connect your GitHub repository. Let AI write, execute, and self-heal your Playwright end-to-end tests in cloud browsers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link 
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition flex items-center justify-center gap-2 shadow-[0_0_32px_-6px_rgba(79,70,229,0.5)]"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => setIsDemoOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-full font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" /> Watch Live Demo
          </button>
        </div>

        <div className="text-xs text-zinc-500 font-medium mb-16 uppercase tracking-wider">
          Trusted by developers worldwide · No credit card required to start
        </div>

        {/* Interactive Terminal Mockup */}
        <div 
          onClick={() => setIsDemoOpen(true)}
          className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto text-left relative cursor-pointer group transition hover:border-zinc-700"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
          <div className="bg-zinc-900/90 px-4 py-3 flex items-center justify-between border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-zinc-500 ml-2 font-mono">testpilot — run #042 · production-suite</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1 group-hover:underline">
              <Play className="w-3 h-3" /> Click to launch interactive view
            </span>
          </div>
          <div className="p-6 font-mono text-[13px] leading-relaxed space-y-2">
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">1</span><span className="text-indigo-400">▶ Starting test run #042 — 10 Playwright tests queued</span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">2</span><span className="text-zinc-500">  Initializing Browserbase cloud browser pool...</span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">3</span><span className="text-emerald-400">  ✓ User Authentication Flow <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] ml-1">PASS</span> <span className="text-zinc-600 ml-1">1.2s</span></span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">4</span><span className="text-emerald-400">  ✓ Dashboard Analytics Load <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] ml-1">PASS</span> <span className="text-zinc-600 ml-1">0.9s</span></span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">5</span><span className="text-amber-400">  ⚡ Selector drifted: '#checkout-btn' → updating Playwright locator</span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">6</span><span className="text-emerald-400">  ✓ Stripe Checkout Flow <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] ml-1">HEALED</span> <span className="text-zinc-600 ml-1">2.1s</span></span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">7</span><span className="text-indigo-400 font-bold">  ✅ Run complete — 10 passed · 0 failed · 1m 48s</span></div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="border-y border-zinc-800/60 bg-zinc-950 py-10 overflow-hidden">
        <p className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Built for modern tech stacks</p>
        <div className="flex justify-center items-center gap-8 md:gap-16 opacity-60 select-none flex-wrap px-6">
          <span className="text-xl font-bold font-sans text-zinc-200">Next.js</span>
          <span className="text-xl font-bold font-sans text-[#61DAFB]">React</span>
          <span className="text-xl font-bold font-sans text-white">GitHub</span>
          <span className="text-xl font-bold font-sans text-[#2EAD33]">Playwright</span>
          <span className="text-xl font-bold font-sans text-[#635BFF]">Stripe</span>
          <span className="text-xl font-bold font-sans text-zinc-200">Vercel</span>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-zinc-100">Everything you need to ship with confidence</h2>
          <p className="text-zinc-400 text-lg">From autonomous script generation to real-time self-healing.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">🤖</div>
            <span className="inline-block bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded mb-3">AI INTELLIGENCE</span>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">AI Test Generation</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Gemini parses your codebase and crafts comprehensive Playwright test cases for every user flow.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">☁️</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Cloud Browser Execution</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Tests run in isolated Browserbase cloud browsers with video replays for every session.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">🔍</div>
            <span className="inline-block bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded mb-3">ROOT CAUSE</span>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Root Cause Analysis</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">AI classifies test failures and pinpoints root causes with step-by-step resolution advice.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">🔧</div>
            <span className="inline-block bg-indigo-950 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded mb-3">AUTONOMOUS</span>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Self-Healing Tests</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Automatically updates broken element locators when UI structures shift, eliminating flaky tests.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Scheduled Runs</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Set automated cron schedules per repository. Execute suite runs hourly, daily, or weekly.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">CI/CD Webhooks</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Unique webhook secret per repo. Trigger test executions directly from GitHub Actions or GitLab CI.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-y border-zinc-800/50 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-zinc-100">How Testpilot Works</h2>
            <p className="text-zinc-400 text-lg">Ship faster with automated quality engineering.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center relative z-10">
              <div className="w-20 h-20 mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-2xl font-black text-indigo-400">
                1
              </div>
              <h3 className="text-lg font-bold mb-2 text-zinc-100">Connect GitHub</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Authenticate with GitHub and import any repository in one click.</p>
            </div>

            <div className="text-center relative z-10">
              <div className="w-20 h-20 mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-2xl font-black text-indigo-400">
                2
              </div>
              <h3 className="text-lg font-bold mb-2 text-zinc-100">AI Generates Tests</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Gemini analyzes your code and creates robust Playwright test scripts.</p>
            </div>

            <div className="text-center relative z-10">
              <div className="w-20 h-20 mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl text-2xl font-black text-indigo-400">
                3
              </div>
              <h3 className="text-lg font-bold mb-2 text-zinc-100">Review & Heal</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Tests run in cloud browsers with video replays and AI self-healing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-zinc-100">Simple, transparent pricing</h2>
          <p className="text-zinc-400 text-lg">Start free, upgrade when your suite demands scale.</p>
        </div>
        <PricingSection />
      </section>

      {/* CTA Banner */}
      <section className="border-t border-zinc-800 bg-zinc-950 py-24 text-center px-6">
        <h2 className="text-4xl font-extrabold tracking-tight mb-6 text-zinc-100">Ready to automate your QA?</h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">Join developers shipping bug-free code with Testpilot.</p>
        <Link 
          href="/sign-up"
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition shadow-lg shadow-indigo-600/30"
        >
          Get Started Free <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight mb-4">
              <span className="text-xl">⚡</span>
              <span className="text-zinc-100">Testpilot</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs">
              Autonomous AI QA Engineer. Ship faster with self-healing Playwright scripts and cloud browser recordings.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#features" className="hover:text-indigo-400 transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-indigo-400 transition">Pricing</a></li>
              <li>
                <button 
                  onClick={() => setIsDocsOpen(true)}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  Documentation
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Legal & Resource</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <button 
                  onClick={() => setLegalModalType('privacy')}
                  className="hover:text-zinc-300 transition cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLegalModalType('terms')}
                  className="hover:text-zinc-300 transition cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <a 
                  href="https://github.com/ramanand-tomar/Ai-Testing-Automation-Agent" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-zinc-300 transition inline-flex items-center gap-1"
                >
                  GitHub Repository <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-zinc-800/50 text-center md:text-left text-sm text-zinc-600 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Testpilot. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      <DemoVideoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
    </div>
  );
}
