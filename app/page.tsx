"use client";

import Link from "next/link";
import { ArrowRight, Play, CheckCircle2, Cloud, Sparkles, RefreshCcw, Calendar, GitPullRequest } from "lucide-react";
import PricingSection from "@/components/pricing-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 border-b border-[#1f1f23] bg-[#09090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <span className="text-xl">⚡</span>
          <span className="text-indigo-400">Testpilot</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-zinc-100 transition">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-100 transition">How It Works</a>
          <a href="#pricing" className="hover:text-zinc-100 transition">Pricing</a>
          <a href="#" className="hover:text-zinc-100 transition">Docs</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 hidden md:block">
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full transition"
          >
            Get Started Free <ArrowRight className="inline-block w-4 h-4 ml-1 -mt-0.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-6 pt-24 pb-16 md:pt-32 md:pb-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-400 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
          AI-Powered End-to-End Testing
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-br from-zinc-100 to-zinc-500 bg-clip-text text-transparent mb-6">
          Your AI QA Engineer,<br />Always On.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10">
          Connect your GitHub repo. Let AI write, run, and self-heal your end-to-end tests. Watch every session on video.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link 
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(79,70,229,0.4)]"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-full font-semibold transition flex items-center justify-center gap-2">
            <Play className="w-4 h-4 text-zinc-400" /> Watch Demo
          </button>
        </div>

        <div className="text-sm text-zinc-500 font-medium mb-16">
          Trusted by 500+ developers · No credit card required
        </div>

        {/* Terminal Mockup */}
        <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-w-3xl mx-auto text-left relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
          <div className="bg-zinc-900/80 px-4 py-3 flex items-center gap-2 border-b border-zinc-800/80">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div className="text-xs text-zinc-500 ml-2 font-mono">testpilot — run #042 · my-org/my-nextjs-app</div>
          </div>
          <div className="p-6 font-mono text-[13px] leading-relaxed space-y-1.5">
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">1</span><span className="text-indigo-400">▶ Starting test run #042 — 10 tests queued</span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">2</span><span className="text-zinc-500">  Launching Browserbase session...</span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">3</span><span className="text-emerald-400">  ✓ User Login Flow <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] ml-1">PASS</span> <span className="text-zinc-600 ml-1">1.2s</span></span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">4</span><span className="text-emerald-400">  ✓ Dashboard Stats Load <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] ml-1">PASS</span> <span className="text-zinc-600 ml-1">0.9s</span></span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">5</span><span className="text-rose-400">  ✗ Stripe Checkout Redirect <span className="bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded text-[10px] ml-1">FAIL</span></span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">6</span><span className="text-indigo-400">  🤖 AI Analysis: Test Fragility — selector changed</span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">7</span><span className="text-amber-400">  🔧 Self-healing... regenerating script...</span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">8</span><span className="text-emerald-400">  ✓ Stripe Checkout Redirect <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] ml-1">HEALED</span> <span className="text-zinc-600 ml-1">2.1s</span></span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">9</span><span className="text-emerald-400">  ✓ GitHub OAuth Connect <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] ml-1">PASS</span> <span className="text-zinc-600 ml-1">1.4s</span></span></div>
            <div className="flex gap-4"><span className="text-zinc-600 w-4 text-right select-none">10</span><span className="text-indigo-400 font-bold">  ✅ Run complete — 9 passed · 0 failed · 2m 14s</span></div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="border-y border-zinc-800/60 bg-zinc-950 py-10 overflow-hidden">
        <p className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Works seamlessly with your stack</p>
        <div className="flex justify-center items-center gap-8 md:gap-16 opacity-50 grayscale select-none flex-wrap px-6">
          <span className="text-xl font-bold font-sans">Next.js</span>
          <span className="text-xl font-bold font-sans text-[#61DAFB]">React</span>
          <span className="text-xl font-bold font-sans text-white">GitHub</span>
          <span className="text-xl font-bold font-sans text-[#2EAD33]">Playwright</span>
          <span className="text-xl font-bold font-sans text-[#008CDD]">Stripe</span>
          <span className="text-xl font-bold font-sans">Vercel</span>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Everything you need to ship with confidence</h2>
          <p className="text-zinc-400 text-lg">From test generation to self-healing — all in one platform.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">🤖</div>
            <span className="inline-block bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded mb-3">AI</span>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">AI Test Generation</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Gemini reads your GitHub repo and writes comprehensive Playwright test cases for every route and user flow.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">☁️</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Cloud Browser Execution</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Tests run in isolated Browserbase cloud browsers. Every session is recorded with full video replay.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">🔍</div>
            <span className="inline-block bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded mb-3">AI</span>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Root Cause Analysis</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">When tests fail, AI classifies the failure and explains what broke in plain English with a suggested fix.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">🔧</div>
            <span className="inline-block bg-indigo-950 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded mb-3">NEW</span>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Self-Healing Tests</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Automatically regenerates broken scripts when selectors change. Tests heal themselves without human intervention.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Scheduled Runs</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Set cron schedules per repository. Run tests hourly, daily, or weekly — automatically, while you sleep.</p>
          </div>

          <div className="bg-[#0d0d0f] border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700 transition">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">CI/CD Webhooks</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Unique webhook URL per repo. Trigger test runs from GitHub Actions, GitLab CI, or any pipeline.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-y border-zinc-800/50 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">How Testpilot Works</h2>
            <p className="text-zinc-400 text-lg">Ship faster with autonomous quality assurance.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-zinc-800 via-indigo-500/50 to-zinc-800"></div>
            
            <div className="text-center relative z-10">
              <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <span className="text-3xl font-black text-indigo-400">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Connect GitHub</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Securely authenticate with GitHub and import any repository in one click.</p>
            </div>

            <div className="text-center relative z-10">
              <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <span className="text-3xl font-black text-indigo-400">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Generates Tests</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Gemini instantly analyzes your codebase and writes comprehensive Playwright test scripts.</p>
            </div>

            <div className="text-center relative z-10">
              <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <span className="text-3xl font-black text-indigo-400">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Watch Results</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Tests execute in the cloud. View session video replays and get AI root cause analysis on failures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-zinc-400 text-lg">Start free, upgrade when you need more power.</p>
        </div>
        <PricingSection />
      </section>

      {/* CTA Banner */}
      <section className="border-t border-zinc-800 bg-zinc-950 py-24 text-center px-6">
        <h2 className="text-4xl font-extrabold tracking-tight mb-6">Ready to automate your QA?</h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">Join hundreds of developers shipping bug-free code with Testpilot.</p>
        <Link 
          href="/sign-up"
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition shadow-lg"
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
              Your AI QA Engineer. Ship faster with autonomous testing, root cause analysis, and self-healing scripts.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#features" className="hover:text-indigo-400 transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-indigo-400 transition">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-zinc-300 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-300 transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-zinc-800/50 text-center md:text-left text-sm text-zinc-600 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Testpilot. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <a href="#" className="hover:text-zinc-300 transition">Twitter</a>
            <a href="#" className="hover:text-zinc-300 transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
