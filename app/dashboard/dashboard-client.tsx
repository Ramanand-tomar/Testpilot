"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  GitBranch, 
  TrendingUp, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import AddRepoDialog from "@/components/modals/add-repo-dialog";
import ActivityFeed from "@/components/dashboard/activity-feed";
import RepoSummaryCard from "@/components/dashboard/repo-summary-card";

interface TestCase {
  id: number;
  repoId: number;
  title: string;
  description: string | null;
  type: string | null;
  targetRoute: string | null;
  expectedResult: string | null;
  status: string | null;
  createdAt: string | Date;
}

interface Repository {
  id: number;
  repoId: string;
  fullName: string;
  description: string | null;
  language: string | null;
  testCases?: TestCase[];
}

interface DashboardClientProps {
  initialRepos: Repository[];
  credits: number;
  githubConnected: boolean;
  plan: string;
}

export default function DashboardClient({
  initialRepos,
  credits: initialCredits,
  githubConnected,
  plan,
}: DashboardClientProps) {
  const router = useRouter();
  const [repos, setRepos] = useState<Repository[]>(initialRepos);
  const [credits, setCredits] = useState(initialCredits);
  const [isConnected, setIsConnected] = useState(githubConnected);

  const fetchUser = async () => {
    const res = await fetch("/api/user");
    if (res.ok) {
      const data = await res.json();
      setCredits(data.credits);
      setIsConnected(data.githubConnected);
    }
  };

  const refreshRepos = async () => {
    const res = await fetch("/api/repositories");
    if (res.ok) {
      setRepos(await res.json());
    }
    await fetchUser();
  };

  // Poll repos and user details if any test is running/pending
  useEffect(() => {
    const hasRunningTests = repos.some(r =>
      r.testCases?.some(t => t.status === "running" || t.status === "pending")
    );
    if (!hasRunningTests) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/repositories");
        if (res.ok) {
          setRepos(await res.json());
        }
        await fetchUser();
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [repos]);

  // Aggregate stats across all repos
  const allTests = repos.flatMap((r) => 
    (r.testCases || []).map(t => ({
      ...t,
      repository: { fullName: r.fullName }
    }))
  );

  const totalTests = allTests.length;
  const passedTests = allTests.filter((t) => t.status === "pass").length;
  const failedTests = allTests.filter((t) => t.status === "fail").length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Title block */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Workspace Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">Get a high-level summary of your testing suites, execution stats, and quick actions.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Tests", value: totalTests, icon: Activity, color: "text-zinc-150" },
          { label: "Passed Runs", value: passedTests, icon: CheckCircle2, color: "text-emerald-450" },
          { label: "Failed Runs", value: failedTests, icon: XCircle, color: "text-rose-450" },
          { label: "Pass Rate", value: `${passRate}%`, icon: TrendingUp, color: "text-indigo-400" },
          { 
            label: "Credits Remaining", 
            value: credits, 
            icon: Coins, 
            color: credits < 100 ? "text-amber-400" : "text-zinc-300",
            warning: credits < 100
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden transition duration-200 hover:border-zinc-700/80 ${
                stat.warning ? "border-amber-500/20 bg-amber-500/[0.01]" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 bg-zinc-950/20">
        <span className="text-sm font-semibold text-zinc-350 tracking-wide">Quick Actions</span>
        
        <div className="flex items-center gap-3">
          <AddRepoDialog githubConnected={isConnected} onAdded={refreshRepos} />

          {!isConnected && (
            <a 
              href="/api/github/connect"
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 rounded-lg text-sm font-semibold transition inline-flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" /> Connect GitHub
            </a>
          )}

          {plan === "Free" && (
            <a 
              href="/pricing"
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition shadow-md inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Upgrade Plan
            </a>
          )}
        </div>
      </div>

      {/* Two column layout */}
      {repos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 bg-zinc-900/10">
          <p className="text-base font-semibold text-zinc-450">No repositories added yet</p>
          <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto mb-6">
            Get started by adding a connected GitHub repository and setting up your automation routes.
          </p>
          <AddRepoDialog githubConnected={isConnected} onAdded={refreshRepos} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Column: Recent Activity */}
          <div className="h-full">
            <ActivityFeed testCases={allTests} />
          </div>

          {/* Right Column: Repository Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" /> Repository Summary
              </h3>
              <a 
                href="/dashboard/repositories"
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 transition"
              >
                Manage <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 max-h-[420px] pr-1">
              {repos.map((repo) => (
                <RepoSummaryCard key={repo.id} repo={repo} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
