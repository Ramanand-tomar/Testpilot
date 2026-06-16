"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle2, XCircle, Clock, Video, Code, FileText, Loader2, Play, Sparkles, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/lib/use-toast';

export default function RunDetailModal({ runId, onClose }: { runId: number, onClose: () => void }) {
  const [run, setRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'script' | 'video' | 'analysis'>('logs');
  const { addToast } = useToast();

  useEffect(() => {
    fetch(`/api/runs/${runId}`)
      .then(res => res.json())
      .then(data => {
        setRun(data);
        if (data.testCases && data.testCases.length > 0) {
          setSelectedTest(data.testCases[0]);
        }
        setLoading(false);
      });
  }, [runId]);

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 flex flex-col h-[90vh] overflow-hidden">
          
          <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50">
            <div>
              <Dialog.Title className="text-xl font-semibold text-zinc-100 flex items-center gap-3">
                <Play className="w-5 h-5 text-indigo-400" />
                Test Run Details
                {run && (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                    run.status === 'complete' && run.failed === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    run.status === 'complete' && run.failed > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {run.status}
                  </span>
                )}
              </Dialog.Title>
              {run && (
                <Dialog.Description className="text-sm text-zinc-400 mt-1 flex items-center gap-4">
                  <span>{new Date(run.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{run.passed} Passed / {run.failed} Failed</span>
                  <span>•</span>
                  <span>{(run.durationMs / 1000).toFixed(1)}s</span>
                </Dialog.Description>
              )}
            </div>
            <div className="flex items-center gap-3">
              {run?.shareToken && (
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/report/${run.shareToken}`;
                    navigator.clipboard.writeText(url);
                    addToast('Report link copied to clipboard', 'success');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-medium transition"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              )}
              <Dialog.Close asChild>
                <button className="text-zinc-400 hover:text-zinc-100 transition p-2 rounded-md hover:bg-zinc-800">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-zinc-800 flex flex-col bg-zinc-900/20">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-300">Executed Tests ({run?.testCases?.length || 0})</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
                ) : (
                  <div className="divide-y divide-zinc-800/50">
                    {run?.testCases?.map((tc: any) => (
                      <button 
                        key={tc.id}
                        onClick={() => setSelectedTest(tc)}
                        className={`w-full text-left p-4 hover:bg-zinc-800/50 transition flex items-center gap-3 ${selectedTest?.id === tc.id ? 'bg-zinc-800/80 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}
                      >
                        {tc.status === 'pass' && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                        {tc.status === 'fail' && <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />}
                        {tc.status === 'running' && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />}
                        {tc.status === 'pending' && <Clock className="w-5 h-5 text-zinc-500 flex-shrink-0" />}
                        
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{tc.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5 truncate">{tc.targetRoute}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 flex flex-col bg-zinc-950">
              {selectedTest ? (
                <>
                  <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
                    <h2 className="text-xl font-bold text-zinc-100">{selectedTest.title}</h2>
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{selectedTest.description}</p>
                    
                    <div className="flex gap-4 mt-6 border-b border-zinc-800">
                      <button 
                        onClick={() => setActiveTab('logs')}
                        className={`pb-3 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'logs' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <FileText className="w-4 h-4" /> Logs
                      </button>
                      <button 
                        onClick={() => setActiveTab('script')}
                        className={`pb-3 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'script' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Code className="w-4 h-4" /> Generated Script
                      </button>
                      <button 
                        onClick={() => setActiveTab('video')}
                        className={`pb-3 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'video' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        <Video className="w-4 h-4" /> Session Video
                      </button>
                      {selectedTest.status === 'fail' && (
                        <button 
                          onClick={() => setActiveTab('analysis')}
                          className={`pb-3 text-sm font-medium transition flex items-center gap-2 ${activeTab === 'analysis' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <Sparkles className="w-4 h-4" /> AI Analysis
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'logs' && (
                      <div className="bg-black border border-zinc-800 rounded-lg p-4 h-full overflow-y-auto font-mono text-sm text-zinc-300">
                        {selectedTest.logs && selectedTest.logs.length > 0 ? (
                          selectedTest.logs.map((log: string, i: number) => (
                            <div key={i} className={`mb-1 ${log.includes('error') || log.includes('fail') ? 'text-rose-400' : ''}`}>
                              {log}
                            </div>
                          ))
                        ) : (
                          <div className="text-zinc-600">No logs available for this test execution.</div>
                        )}
                      </div>
                    )}

                    {activeTab === 'script' && (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 h-full overflow-y-auto font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                        {selectedTest.script || <span className="text-zinc-600">No script generated.</span>}
                      </div>
                    )}

                    {activeTab === 'video' && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Video className="w-16 h-16 text-zinc-800 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-200">Browserbase Session</h3>
                        <p className="text-sm text-zinc-400 mt-2 max-w-md">
                          Browserbase provides a full interactive video recording and timeline of the session.
                        </p>
                        {selectedTest.sessionUrl ? (
                          <a 
                            href={selectedTest.sessionUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-semibold transition shadow-md"
                          >
                            Open Session Player ↗
                          </a>
                        ) : (
                          <p className="text-sm text-rose-500 mt-4">No session recorded for this test.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'analysis' && selectedTest.status === 'fail' && (
                      <div className="flex flex-col space-y-6 font-sans">
                        {selectedTest.failureType || selectedTest.rootCause ? (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-zinc-400">Failure Classification:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                selectedTest.failureType === 'Real Bug' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                selectedTest.failureType === 'Test Fragility' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                selectedTest.failureType === 'Environment Issue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                selectedTest.failureType === 'Auth Failure' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}>
                                {selectedTest.failureType || 'Unknown'}
                              </span>
                            </div>

                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-5">
                              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Root Cause Analysis
                              </h4>
                              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {selectedTest.rootCause || "No root cause analysis available."}
                              </p>
                            </div>

                            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-5">
                              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Suggested Fix
                              </h4>
                              <p className="text-sm text-indigo-200/80 leading-relaxed whitespace-pre-wrap">
                                {selectedTest.suggestedFix || "No suggested fix available."}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center">
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
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                  <p>Select a test case to view details</p>
                </div>
              )}
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
