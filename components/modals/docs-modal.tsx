"use client";

import React, { useState } from 'react';
import { X, BookOpen, Code, Terminal, Zap, Shield, GitBranch, Copy, Check } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copySnippet = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const yamlCode = `name: Testpilot Automated QA
on:
  push:
    branches: [ main, develop ]
  pull_request:

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Testpilot Webhook
        run: |
          curl -X POST https://testpilot.ai/api/webhooks/trigger \\
            -H "Content-Type: application/json" \\
            -d '{"secret": "\${{ secrets.TESTPILOT_WEBHOOK_SECRET }}"}'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Testpilot Developer Documentation</h3>
              <p className="text-xs text-zinc-400">Quickstart guide, GitHub Actions setup, and API webhooks reference</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" /> 1. Quickstart Overview
            </h4>
            <p className="text-zinc-400">
              Testpilot acts as your autonomous QA Engineer. Connect your GitHub repository, define your target application URL, and Gemini 2.5 Flash will automatically generate, execute, and self-heal end-to-end Playwright tests in cloud browser environments powered by Browserbase.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h4 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" /> 2. GitHub Actions CI/CD Integration
            </h4>
            <p className="text-zinc-400">
              Trigger automated test runs directly on push or pull request events using your repository&apos;s unique webhook secret:
            </p>
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300">
              <button 
                onClick={() => copySnippet(yamlCode, 'github')}
                className="absolute top-3 right-3 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-sans flex items-center gap-1 transition"
              >
                {copiedSection === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'github' ? 'Copied!' : 'Copy YAML'}
              </button>
              <pre className="overflow-x-auto"><code>{yamlCode}</code></pre>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h4 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" /> 3. Self-Healing Intelligence Engine
            </h4>
            <p className="text-zinc-400">
              When UI selectors change or DOM structures update in production, Testpilot detects test failures, analyzes page snapshots using Gemini vision models, automatically updates locator selectors, and re-executes assertions without human intervention.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
