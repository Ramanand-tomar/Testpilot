"use client";

import { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronRight, Loader2, PlayCircle, CheckCircle2, XCircle, Share2 } from 'lucide-react';
import RunDetailModal from './modals/run-detail-modal';
import { useToast } from '@/lib/use-toast';

export default function RunHistory({ repoId }: { repoId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const { addToast } = useToast();

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/runs?repoId=${repoId}`);
      if (res.ok) {
        setRuns(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen && runs.length === 0) {
      fetchRuns();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="border-t border-zinc-800/80 bg-zinc-950/30">
      <button 
        onClick={handleToggle}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-zinc-900/50 transition group"
      >
        <div className="flex items-center gap-3">
          <History className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition" />
          <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition">Test Run History</span>
          {runs.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold">
              {runs.length} RUNS
            </span>
          )}
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
      </button>

      {isOpen && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            </div>
          ) : runs.length === 0 ? (
            <div className="text-center p-6 text-sm text-zinc-500">
              No test runs recorded yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {runs.map((run) => (
                <div key={run.id} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-10 h-10 bg-zinc-950 rounded-full border border-zinc-800">
                      <span className="text-xs font-bold text-zinc-400">#{run.id}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${
                          run.status === 'complete' && run.failed === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          run.status === 'complete' && run.failed > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {run.status}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(run.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-300">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> {run.passed}</span>
                        <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-rose-500"/> {run.failed}</span>
                        <span className="text-xs text-zinc-500 ml-2">({(run.durationMs / 1000).toFixed(1)}s)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {run.shareToken && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = `${window.location.origin}/report/${run.shareToken}`;
                          navigator.clipboard.writeText(url);
                          addToast('Report link copied to clipboard', 'success');
                        }}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 text-xs font-medium rounded border border-zinc-700 transition"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedRunId(run.id)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedRunId && (
        <RunDetailModal runId={selectedRunId} onClose={() => setSelectedRunId(null)} />
      )}
    </div>
  );
}
