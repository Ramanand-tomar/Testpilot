"use client";

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import { Activity, Clock, CheckCircle2, XCircle, Code, FileText, Video, ExternalLink } from 'lucide-react';

export default function ReportPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const resolvedParams = use(params);
  const { shareToken } = resolvedParams;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/reports/${shareToken}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="w-8 h-8 text-indigo-500 mb-4 animate-bounce" />
          <p className="text-zinc-500 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        {/* Header */}
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Test Run Report</h1>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-zinc-500 mt-6">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-300">Repository:</span>
              <span className="bg-zinc-900 px-2 py-1 rounded text-zinc-300 border border-zinc-800">{report.repo.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{new Date(report.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-zinc-800 border border-zinc-700">
                Trigger: {report.triggeredBy}
              </span>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            <h2 className="text-lg font-semibold text-zinc-100">Test Cases ({report.testCases.length})</h2>
            <div className="grid gap-3">
              {report.testCases.map((tc: any) => (
                <div 
                  key={tc.id} 
                  onClick={() => setActiveTest(activeTest?.id === tc.id ? null : tc)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    activeTest?.id === tc.id 
                      ? 'bg-zinc-900 border-zinc-700' 
                      : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {tc.status === 'pass' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <h3 className="font-medium text-zinc-200">{tc.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{tc.description}</p>
                      </div>
                    </div>
                    {tc.wasHealed && (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 shrink-0">
                        Healed
                      </span>
                    )}
                  </div>

                  {/* Expanded View */}
                  {activeTest?.id === tc.id && (
                    <div className="mt-6 pt-6 border-t border-zinc-800 grid gap-6" onClick={(e) => e.stopPropagation()}>
                      {/* Logs */}
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Execution Logs
                        </h4>
                        <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto">
                          {tc.logs && tc.logs.length > 0 ? (
                            <div className="space-y-1">
                              {tc.logs.map((log: string, i: number) => {
                                let colorClass = "text-zinc-400";
                                if (log.toLowerCase().includes("error") || log.toLowerCase().includes("fail")) colorClass = "text-rose-400";
                                else if (log.toLowerCase().includes("success")) colorClass = "text-emerald-400";
                                return (
                                  <div key={i} className={colorClass}>
                                    <span className="text-zinc-700 mr-3">{String(i + 1).padStart(2, '0')}</span>
                                    {log}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-zinc-600">No logs available.</span>
                          )}
                        </div>
                      </div>

                      {/* Video */}
                      {tc.sessionId && (
                        <div>
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Video className="w-4 h-4" /> Session Recording
                          </h4>
                          <div className="rounded-lg overflow-hidden border border-zinc-800 bg-black aspect-video relative">
                            <iframe 
                              src={`https://browserbase.com/sessions/${tc.sessionId}/replay`}
                              className="w-full h-full absolute inset-0"
                              allow="autoplay; fullscreen"
                            />
                          </div>
                          <div className="mt-2 text-right">
                             <a href={tc.sessionUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1">
                               Open in Browserbase <ExternalLink className="w-3 h-3" />
                             </a>
                          </div>
                        </div>
                      )}

                      {/* AI Analysis (if failed) */}
                      {tc.status === 'fail' && tc.rootCause && (
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
                          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">AI Root Cause Analysis</h4>
                          <div className="mb-3">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                              {tc.failureType || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{tc.rootCause}</p>
                          <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Suggested Fix</h5>
                          <p className="text-sm text-zinc-400 leading-relaxed">{tc.suggestedFix}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Run Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-light text-zinc-100">{report.totalTests}</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Tests</div>
                </div>
                <div className="pt-4 border-t border-zinc-800/50">
                  <div className="text-2xl font-light text-emerald-400">{report.passed}</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Passed</div>
                </div>
                <div className="pt-4 border-t border-zinc-800/50">
                  <div className="text-2xl font-light text-rose-400">{report.failed}</div>
                  <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Failed</div>
                </div>
                {report.durationMs && (
                  <div className="pt-4 border-t border-zinc-800/50">
                    <div className="text-lg font-light text-zinc-300">{(report.durationMs / 1000).toFixed(1)}s</div>
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Duration</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
