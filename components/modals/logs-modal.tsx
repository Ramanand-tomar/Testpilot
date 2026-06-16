"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, Play, Code, FileText, Compass, Video, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function LogsModal({ 
  testCase, 
  globalInstruction, 
  knownIssues, 
  onClose 
}: { 
  testCase: any, 
  globalInstruction?: string, 
  knownIssues?: string, 
  onClose: () => void 
}) {
  const logs: string[] = testCase.logs || [];
  const [activeTab, setActiveTab] = useState<'logs' | 'script' | 'instructions' | 'video' | 'analysis'>('logs');

  const tabs = [
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'script', label: 'Script', icon: Code },
    { id: 'instructions', label: 'Agent Instructions', icon: Compass },
    { id: 'video', label: 'Video', icon: Video },
    ...(testCase.status === 'fail' ? [{ id: 'analysis', label: 'AI Analysis', icon: Sparkles }] : []),
  ] as const;

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 flex flex-col h-[80vh] max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <div>
              <Dialog.Title className="text-xl font-semibold text-zinc-100">{testCase.title}</Dialog.Title>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-zinc-400">Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                  testCase.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  testCase.status === 'fail' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  testCase.status === 'running' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                  'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}>
                  {testCase.status}
                </span>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="text-zinc-400 hover:text-zinc-100 p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </Dialog.Close>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-zinc-800 bg-zinc-900/10 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3.5 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer -mb-px ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400 font-bold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Box */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-950 flex flex-col">
            
            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="flex-1 font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-zinc-500 text-center py-20">No logs available.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => {
                      let colorClass = "text-zinc-300";
                      if (log.toLowerCase().includes("error") || log.toLowerCase().includes("fail")) colorClass = "text-rose-450";
                      else if (log.toLowerCase().includes("success")) colorClass = "text-emerald-400";
                      
                      return (
                        <div key={i} className={`py-0.5 ${colorClass} leading-relaxed`}>
                          <span className="text-zinc-650 select-none mr-3 inline-block w-8 text-right">{String(i + 1).padStart(3, '0')}</span>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Script Tab */}
            {activeTab === 'script' && (
              <div className="flex-1 flex flex-col">
                {testCase.wasHealed && (
                  <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-2 text-amber-400 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    ⚡ This script was auto-healed from a previous fragile version
                  </div>
                )}
                {testCase.script ? (
                  <pre className="font-mono text-xs overflow-auto whitespace-pre p-4 bg-zinc-950 rounded-lg border border-zinc-850 text-zinc-350 flex-1 min-h-[300px]">
                    <code>{testCase.script}</code>
                  </pre>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-20 font-mono text-zinc-600">
                    No script available.
                  </div>
                )}
              </div>
            )}

            {/* Agent Instructions Tab */}
            {activeTab === 'instructions' && (
              <div className="space-y-4 font-sans">
                {[
                  { label: "Target Route", value: testCase.targetRoute || "/" },
                  { label: "Expected Result", value: testCase.expectedResult || "None" },
                  { label: "Global Instructions", value: globalInstruction || "None" },
                  { label: "Known Issues", value: knownIssues || "None" },
                ].map((instruction, index) => (
                  <div key={index} className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      {instruction.label}
                    </h4>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {instruction.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Video Tab */}
            {activeTab === 'video' && (
              <div className="flex-1 flex flex-col min-h-[350px]">
                {testCase.sessionId ? (
                  <div className="flex-1 flex flex-col space-y-4">
                    <iframe 
                      src={`https://browserbase.com/sessions/${testCase.sessionId}/replay`}
                      className="w-full flex-1 min-h-[380px] border border-zinc-800 rounded-lg bg-black shadow-inner"
                      allow="autoplay; fullscreen"
                    />
                    <div className="text-center pt-2">
                      <a 
                        href={testCase.sessionUrl || `https://browserbase.com/sessions/${testCase.sessionId}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-indigo-405 hover:text-indigo-400 underline font-sans flex items-center justify-center gap-1.5"
                      >
                        Open Session Replay in a new window →
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-800 rounded-lg">
                    <p className="text-zinc-500 text-sm mb-4 font-sans">No session recording available for this test case run.</p>
                    {testCase.sessionUrl && (
                      <a 
                        href={testCase.sessionUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition shadow-md font-sans"
                      >
                        <Play className="w-3.5 h-3.5" /> Watch Session Replay externally
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AI Analysis Tab */}
            {activeTab === 'analysis' && testCase.status === 'fail' && (
              <div className="flex-1 flex flex-col space-y-6 font-sans">
                {testCase.failureType || testCase.rootCause ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-400">Failure Classification:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        testCase.failureType === 'Real Bug' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        testCase.failureType === 'Test Fragility' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        testCase.failureType === 'Environment Issue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        testCase.failureType === 'Auth Failure' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {testCase.failureType || 'Unknown'}
                      </span>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5">
                      <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Root Cause Analysis
                      </h4>
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {testCase.rootCause || "No root cause analysis available."}
                      </p>
                    </div>

                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-5">
                      <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> Suggested Fix
                      </h4>
                      <p className="text-sm text-indigo-200/80 leading-relaxed whitespace-pre-wrap">
                        {testCase.suggestedFix || "No suggested fix available."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <Sparkles className="w-10 h-10 text-zinc-700 mb-4" />
                    <p className="text-zinc-400 font-medium">AI Analysis Pending or Unavailable</p>
                    <p className="text-zinc-600 text-sm mt-2 max-w-sm">
                      The AI RCA may still be processing in the background, or it encountered an error during generation. Try refreshing in a few seconds.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
