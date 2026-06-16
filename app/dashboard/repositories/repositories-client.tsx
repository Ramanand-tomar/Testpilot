"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Github, Search, AlertCircle, GitBranch, ArrowRight } from "lucide-react";
import RepositoryCard from "@/components/repository-card";
import AddRepoDialog from "@/components/modals/add-repo-dialog";

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

export default function RepositoriesClient({
  initialRepos,
  githubConnected,
}: {
  initialRepos: Repository[];
  githubConnected: boolean;
}) {
  const router = useRouter();
  const [repos, setRepos] = useState<Repository[]>(initialRepos);
  const [isConnected, setIsConnected] = useState(githubConnected);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUser = async () => {
    const res = await fetch("/api/user");
    if (res.ok) {
      const data = await res.json();
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

  // Poll repos if any test is running/pending
  useEffect(() => {
    const hasRunningTests = repos.some((r) =>
      r.testCases?.some((t) => t.status === "running" || t.status === "pending")
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

  const filteredRepos = repos.filter((r) =>
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Repositories</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your connected repositories, configure fail areas, and run automated testing.
          </p>
        </div>
        <AddRepoDialog githubConnected={isConnected} onAdded={refreshRepos} />
      </div>

      {/* GitHub connection banner if not connected */}
      {!isConnected && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">GitHub disconnected</h3>
              <p className="text-xs text-zinc-450 mt-1 max-w-xl">
                Please connect your GitHub account to import repositories, fetch branch lists, and configure automated testing suites.
              </p>
            </div>
          </div>
          <a
            href="/api/github/connect"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 shrink-0"
          >
            <Github className="w-4 h-4" /> Connect GitHub
          </a>
        </div>
      )}

      {/* Filter and search bar */}
      {repos.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search connected repositories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition duration-150"
          />
        </div>
      )}

      {/* Repositories grid/list */}
      {repos.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/[0.05] space-y-6">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center mx-auto text-indigo-400">
            <GitBranch className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-zinc-200">No repositories added yet</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {!isConnected
                ? "Connect your GitHub account to import repositories and initialize automation scripts."
                : "Import a connected repository to set up QA routing and target domains."}
            </p>
          </div>
          <div>
            {!isConnected ? (
              <a
                href="/api/github/connect"
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition inline-flex items-center gap-1.5 shadow-md"
              >
                <Github className="w-4.5 h-4.5" /> Connect GitHub <ArrowRight className="w-4 h-4 ml-0.5" />
              </a>
            ) : (
              <AddRepoDialog githubConnected={isConnected} onAdded={refreshRepos} />
            )}
          </div>
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="text-center py-16 border border-zinc-850 rounded-2xl text-zinc-500 bg-zinc-900/[0.02]">
          <p className="text-sm font-medium">No repositories match "{searchQuery}"</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRepos.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} onUpdate={refreshRepos} />
          ))}
        </div>
      )}
    </div>
  );
}
