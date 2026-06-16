"use client";

import { useState, useEffect } from "react";
import RepositoryCard from "@/components/repository-card";
import AddRepoDialog from "@/components/modals/add-repo-dialog";

export default function DashboardClient({ initialRepos, credits: initialCredits, githubConnected }: { initialRepos: any[], credits: number, githubConnected: boolean }) {
  const [repos, setRepos] = useState(initialRepos);
  const [credits, setCredits] = useState(initialCredits);

  const allTests = repos.flatMap((r) => r.testCases || []);
  const totalTests = allTests.length;
  const passed = allTests.filter((t) => t.status === "pass").length;
  const failed = allTests.filter((t) => t.status === "fail").length;
  const passRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

  const fetchUser = async () => {
    const res = await fetch('/api/user');
    if (res.ok) {
      const data = await res.json();
      setCredits(data.credits);
    }
  };

  useEffect(() => {
    const hasRunningTests = repos.some(r => r.testCases?.some((t: any) => t.status === "running" || t.status === "pending"));
    if (!hasRunningTests) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/repositories');
        if (res.ok) {
          const updatedRepos = await res.json();
          setRepos(updatedRepos);
        }
        await fetchUser();
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [repos]);

  const refreshRepos = async () => {
    const res = await fetch('/api/repositories');
    if (res.ok) {
      setRepos(await res.json());
    }
    await fetchUser();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-700">
            {credits} Credits
          </div>
          <AddRepoDialog githubConnected={githubConnected} onAdded={refreshRepos} />
        </div>
      </header>

      <section className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Tests", value: totalTests },
          { label: "Passed", value: passed, color: "text-emerald-400" },
          { label: "Failed", value: failed, color: "text-rose-400" },
          { label: "Pass Rate", value: `${passRate}%` },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm text-zinc-400 font-medium">{stat.label}</h3>
            <p className={`text-3xl font-bold mt-2 ${stat.color || "text-zinc-100"}`}>{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="space-y-6">
        {repos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl text-zinc-500">
            No repositories added yet.
          </div>
        ) : (
          repos.map(repo => (
            <RepositoryCard 
              key={repo.id} 
              repo={repo} 
              onUpdate={refreshRepos} 
            />
          ))
        )}
      </div>
    </div>
  );
}
