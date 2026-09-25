"use client";

import React, { useState } from 'react';
import { X, Play, CheckCircle2, Sparkles, RefreshCw, Terminal, ShieldCheck } from 'lucide-react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const demoSteps = [
    { title: "Analyzing Repository", status: "pass", duration: "1.1s", detail: "Gemini 2.5 Flash parsed Next.js router & API routes" },
    { title: "Generating Playwright Test", status: "pass", duration: "2.4s", detail: "Created e2e script for /checkout & /auth flows" },
    { title: "Executing in Cloud Browser", status: "pass", duration: "4.8s", detail: "Browserbase Chromium session #sess_99a8f2 initialized" },
    { title: "Detecting Fragile Selector", status: "healed", duration: "1.9s", detail: "Button selector '#submit-btn' changed to '[data-testid=pay-btn]'" },
    { title: "Self-Healing Test Script", status: "pass", duration: "0.8s", detail: "AI updated Playwright locator & re-ran assertion cleanly" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Play className="w-4 h-4 fill-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Testpilot Live Execution Demo</h3>
              <p className="text-xs text-zinc-400">Watch AI write, execute, and self-heal end-to-end Playwright tests in real-time</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Visual Simulation Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Mock Browser Player Frame */}
          <div className="bg-[#09090b] border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
            {/* Top Browser Bar */}
            <div className="bg-zinc-900/90 px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="bg-zinc-950 px-3 py-1 rounded-md border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                https://cloud.browserbase.com/session/live-preview-042
              </div>
              <div className="text-xs font-mono text-indigo-400 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                LIVE AGENT
              </div>
            </div>

            {/* Simulated Live Playwright Code & Session Stream */}
            <div className="p-6 font-mono text-xs leading-relaxed grid md:grid-cols-2 gap-6 bg-[#09090b]">
              {/* Left Column: Playwright Script */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-zinc-500 text-[11px]">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" /> generated-checkout.spec.ts
                  </span>
                  <span className="text-emerald-400">Playwright v1.63</span>
                </div>
                <pre className="text-zinc-300 text-[11px] overflow-x-auto pt-2 space-y-1">
                  <code>
                    <span className="text-purple-400">import</span> &#123; test, expect &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">'@playwright/test'</span>;<br/><br/>
                    test(<span className="text-emerald-300">'User Stripe Checkout Flow'</span>, <span className="text-purple-400">async</span> (&#123; page &#125;) =&gt; &#123;<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">await</span> page.goto(<span className="text-emerald-300">'http://localhost:3000/#pricing'</span>);<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">await</span> page.click(<span className="text-emerald-300">'text=Upgrade to Pro'</span>);<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">await</span> expect(page).toHaveURL(<span className="text-emerald-300">/checkout\.stripe\.com/</span>);<br/>
                    &nbsp;&nbsp;<span className="text-zinc-500">// AI Self-healed selector:</span><br/>
                    &nbsp;&nbsp;<span className="text-purple-400">await</span> page.fill(<span className="text-emerald-300">'[data-testid=card-number]'</span>, <span className="text-amber-300">'4242...'</span>);<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">await</span> page.click(<span className="text-emerald-300">'button:has-text("Subscribe")'</span>);<br/>
                    &#125;);
                  </code>
                </pre>
              </div>

              {/* Right Column: AI Agent Terminal Activity */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-zinc-500 text-[11px]">
                  <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Agent Intelligence Log
                  </span>
                  <span className="text-zinc-500">Run ID #042</span>
                </div>
                
                <div className="space-y-2 text-[11px]">
                  {demoSteps.map((step, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveStep(idx)}
                      className={`p-2.5 rounded border transition cursor-pointer flex items-center justify-between ${
                        activeStep === idx 
                          ? 'bg-zinc-900 border-indigo-500/50 text-zinc-100' 
                          : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {step.status === 'healed' ? (
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{step.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{step.duration}</span>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-indigo-950/30 border border-indigo-500/20 rounded text-[11px] text-indigo-300">
                  💡 {demoSteps[activeStep].detail}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-between items-center">
          <p className="text-xs text-zinc-400">Experience zero-maintenance testing with autonomous AI self-healing.</p>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
