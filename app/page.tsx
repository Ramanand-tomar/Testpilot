import Link from "next/link";
import { ArrowRight, Bot, Cloud, BarChart3, Github, PlayCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-indigo-500/30">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-bold text-xl tracking-tight">AI Testing Agent</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-zinc-300 hover:text-white transition">Sign In</Link>
          <Link href="/sign-up" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition shadow-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      <section className="py-24 px-8 max-w-5xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
          Automated QA Powered by AI
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Connect your GitHub repository and let Gemini AI instantly write and execute test cases in real cloud browsers. Watch full video recordings of your tests passing.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/sign-up" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-base font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-900/20">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/sign-in" className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-full text-base font-semibold transition">
            Sign In
          </Link>
        </div>
      </section>

      <section className="py-20 px-8 bg-zinc-900/30 border-t border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Everything you need to automate QA</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Test Generation</h3>
              <p className="text-zinc-400 leading-relaxed">
                Connect your GitHub repo and let Gemini AI automatically read your code and write comprehensive test cases tailored to your logic.
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                <Cloud className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cloud Browser Execution</h3>
              <p className="text-zinc-400 leading-relaxed">
                Tests run sequentially in real Browserbase cloud browsers using Playwright. Every step is captured with full video recordings.
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pass/Fail Analytics</h3>
              <p className="text-zinc-400 leading-relaxed">
                Track your entire test suite health. Dive deep into step-by-step logs, analyze failure points, and monitor your pass rate dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-zinc-500">1</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3"><Github className="w-6 h-6 text-zinc-400" /> Connect GitHub</h3>
              <p className="text-zinc-400 text-lg">Securely connect your GitHub account and import your web application repositories directly into the workspace.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-zinc-500">2</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3"><Bot className="w-6 h-6 text-indigo-400" /> Generate Tests</h3>
              <p className="text-zinc-400 text-lg">Gemini scans your file tree, filters out noise, and crafts 5-10 highly targeted Playwright test cases perfectly aligned with your routes.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-zinc-500">3</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 flex items-center gap-3"><PlayCircle className="w-6 h-6 text-emerald-400" /> Watch Results</h3>
              <p className="text-zinc-400 text-lg">Execute your tests. The platform launches isolated Browserbase sessions and streams logs directly to your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-zinc-600 border-t border-zinc-900 text-sm">
        <p>&copy; 2026 AI Testing Agent. Built for speed and reliability.</p>
      </footer>
    </main>
  );
}
