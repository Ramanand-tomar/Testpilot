"use client";

import { useState } from "react";
import TestCaseRow from "./test-case-row";
import { Loader2, Trash2 } from "lucide-react";

export default function RepositoryCard({ repo, onUpdate }: { repo: any, onUpdate: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await fetch(`/api/repositories/${repo.id}/generate`, { method: "POST" });
    setIsGenerating(false);
    onUpdate();
  };

  const handleRunSelected = async () => {
    if (selectedTests.length === 0) return;
    setIsRunning(true);
    await fetch("/api/test-cases/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testIds: selectedTests, repoId: repo.id }),
    });
    setIsRunning(false);
    setSelectedTests([]);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this repository? All tests will be lost.")) return;
    setIsDeleting(true);
    await fetch(`/api/repositories/${repo.id}`, { method: "DELETE" });
    setIsDeleting(false);
    onUpdate();
  };

  const toggleTestSelection = (id: number) => {
    setSelectedTests(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">{repo.fullName}</h2>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
              {repo.defaultBranch}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
              {repo.language}
            </span>
          </div>
          <a href={repo.targetDomain} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline mt-1 block">
            {repo.targetDomain}
          </a>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-md transition"
            title="Delete Repository"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            Generate Tests
          </button>
          <button 
            onClick={handleRunSelected}
            disabled={isRunning || selectedTests.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {isRunning && <Loader2 className="w-4 h-4 animate-spin" />}
            Run Selected ({selectedTests.length})
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-zinc-800">
        {repo.testCases?.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No test cases found. Generate tests to get started.
          </div>
        ) : (
          repo.testCases?.map((tc: any) => (
            <TestCaseRow 
              key={tc.id} 
              testCase={tc} 
              isSelected={selectedTests.includes(tc.id)}
              onToggle={() => toggleTestSelection(tc.id)}
              onUpdate={onUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
