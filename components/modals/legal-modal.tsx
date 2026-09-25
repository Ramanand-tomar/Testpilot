"use client";

import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              {isPrivacy ? <ShieldCheck className="w-4 h-4 text-indigo-400" /> : <FileText className="w-4 h-4 text-indigo-400" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">
                {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <p className="text-xs text-zinc-400">Last updated: September 25, 2026</p>
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
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-zinc-300 leading-relaxed">
          {isPrivacy ? (
            <>
              <h4 className="text-sm font-bold text-zinc-100">1. Information We Collect</h4>
              <p className="text-xs text-zinc-400">
                Testpilot collects authentication data via Clerk, GitHub repository metadata (repo name, default branch), test run logs, and payment details processed via Stripe. We do not sell your personal data.
              </p>

              <h4 className="text-sm font-bold text-zinc-100 mt-4">2. Data Security & Storage</h4>
              <p className="text-xs text-zinc-400">
                All cloud browser sessions executed on Browserbase are isolated and encrypted in transit. Source code analyzed by AI models is stored strictly in memory for test generation and is never used to train global public models.
              </p>

              <h4 className="text-sm font-bold text-zinc-100 mt-4">3. Third-Party Integrations</h4>
              <p className="text-xs text-zinc-400">
                We integrate with Google Gemini API for AI test intelligence, Clerk for identity security, Neon DB for persistent storage, and Stripe for subscription processing.
              </p>
            </>
          ) : (
            <>
              <h4 className="text-sm font-bold text-zinc-100">1. Acceptable Use Policy</h4>
              <p className="text-xs text-zinc-400">
                You agree to use Testpilot solely for lawful automated software testing and quality assurance of web applications you own or have explicit authorization to audit.
              </p>

              <h4 className="text-sm font-bold text-zinc-100 mt-4">2. Subscription & Credit Allocations</h4>
              <p className="text-xs text-zinc-400">
                Credits are allocated based on your selected plan tier (Free, Pro, Team). Credits reset monthly. Subscriptions may be canceled at any time via the Stripe Customer Portal.
              </p>

              <h4 className="text-sm font-bold text-zinc-100 mt-4">3. Service Level & Limitation of Liability</h4>
              <p className="text-xs text-zinc-400">
                Testpilot is provided &quot;as is&quot;. While we strive for 99.9% availability and accurate AI assertions, users are advised to review test scripts prior to deployment in critical environments.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
