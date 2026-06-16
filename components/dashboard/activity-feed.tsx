"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Clock, Play } from "lucide-react";

interface TestCase {
  id: number;
  title: string;
  status: string | null;
  createdAt: string | Date;
  repository?: {
    fullName: string;
  };
}

export function formatDistanceToNow(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) return "just now";
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function ActivityFeed({ testCases }: { testCases: TestCase[] }) {
  // Sort test cases by createdAt descending and take top 10
  const sortedRuns = [...testCases]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" /> Recent Activity Feed
        </h3>
      </div>

      <div className="flex-1 divide-y divide-zinc-800/50 overflow-y-auto min-h-[300px]">
        {sortedRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-zinc-500 min-h-[300px]">
            <Play className="w-8 h-8 text-zinc-650 mb-2 opacity-50" />
            <p className="text-sm">No recent activity found.</p>
            <p className="text-xs text-zinc-600 mt-1">Run tests in your repositories to populate the feed.</p>
          </div>
        ) : (
          sortedRuns.map((run) => {
            const isPass = run.status === "pass";
            const isFail = run.status === "fail";
            const isRunning = run.status === "running" || run.status === "pending";

            return (
              <div key={run.id} className="p-4 hover:bg-zinc-850/30 transition duration-150 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Badge */}
                  <div>
                    {isPass && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                    {isFail && <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />}
                    {isRunning && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />}
                    {!isPass && !isFail && !isRunning && <Clock className="w-5 h-5 text-zinc-500 flex-shrink-0" />}
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {run.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {run.repository?.fullName || "Unknown Repository"}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    isPass ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    isFail ? "bg-rose-500/10 text-rose-450 border-rose-500/20" :
                    isRunning ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                    "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}>
                    {run.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {formatDistanceToNow(run.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800/80 text-center">
        <Link 
          href="/dashboard/repositories" 
          className="text-xs font-semibold text-indigo-450 hover:text-indigo-400 transition"
        >
          View all in Repositories →
        </Link>
      </div>
    </div>
  );
}
