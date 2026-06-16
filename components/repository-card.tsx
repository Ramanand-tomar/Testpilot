"use client";

import { useState } from "react";
import TestCaseRow from "./test-case-row";
import { Loader2, Trash2, Clock } from "lucide-react";
import RepoSettingsDialog from "./modals/repo-settings-dialog";
import AiReportModal from "./modals/ai-report-modal";
import WebhookDialog from "./modals/webhook-dialog";
import CreateTestDialog from "./modals/create-test-dialog";
import ScheduleDialog from "./modals/schedule-dialog";
import RunHistory from "./run-history";
import { useToast } from "@/lib/use-toast";

export default function RepositoryCard({ repo, onUpdate }: { repo: any, onUpdate: () => void }) {
  const { addToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/repositories/${repo.id}/generate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const count = data.count || data.testCases?.length || 0;
        addToast(count > 0 ? `Generated ${count} test cases` : "Generated test cases", "success");
      } else if (res.status === 402 || res.status === 403) {
        addToast("Not enough credits. Upgrade your plan.", "error");
      } else {
        addToast("Failed to generate tests. Check your credits.", "error");
      }
    } catch (e) {
      addToast("Failed to generate tests. Check your credits.", "error");
    }
    setIsGenerating(false);
    onUpdate();
  };

  const handleRunSelected = async () => {
    if (selectedTests.length === 0) return;
    setIsRunning(true);
    addToast(`Running ${selectedTests.length} tests in Browserbase...`, "info");
    
    try {
      const res = await fetch("/api/test-cases/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testIds: selectedTests, repoId: repo.id }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const passed = data.results?.filter((r: any) => r.status === "pass").length || 0;
        const failed = data.results?.filter((r: any) => r.status === "fail").length || 0;
        addToast(`Tests complete: ${passed} passed, ${failed} failed`, "success");
      } else {
        const errText = await res.text();
        if (res.status === 402 || res.status === 403 || errText.toLowerCase().includes("credit")) {
          addToast("Not enough credits. Upgrade your plan.", "error");
        } else {
          addToast("Failed to run tests.", "error");
        }
      }
    } catch (e) {
      addToast("Failed to run tests.", "error");
    }
    
    setIsRunning(false);
    setSelectedTests([]);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this repository? All tests will be lost.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/repositories/${repo.id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Repository removed", "success");
      } else {
        addToast("Failed to remove repository", "error");
      }
    } catch (e) {
      addToast("Failed to remove repository", "error");
    }
    setIsDeleting(false);
    onUpdate();
  };

  const toggleTestSelection = (id: number) => {
    setSelectedTests(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedTests.length === repo.testCases?.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(repo.testCases?.map((t: any) => t.id) || []);
    }
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
          <RepoSettingsDialog repo={repo} onUpdated={onUpdate} />
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
          <CreateTestDialog repo={repo} onCreated={onUpdate} />
          <WebhookDialog repo={repo} />
          <button
            onClick={() => setShowScheduleDialog(true)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md text-sm font-medium transition flex items-center gap-2 border border-zinc-700"
          >
            <Clock className="w-4 h-4" />
            Schedule
          </button>
          {showScheduleDialog && (
            <ScheduleDialog 
              repoId={repo.id}
              schedule={repo.schedules?.[0]}
              onClose={() => setShowScheduleDialog(false)}
              onUpdate={onUpdate}
            />
          )}
          <button 
            onClick={handleRunSelected}
            disabled={isRunning || selectedTests.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {isRunning && <Loader2 className="w-4 h-4 animate-spin" />}
            Run Selected ({selectedTests.length})
          </button>
          <AiReportModal repo={repo} />
        </div>
      </div>
      
      <RunHistory repoId={repo.id} />
      
      <div className="divide-y divide-zinc-800">
        {repo.testCases?.length > 0 && (
          <div className="px-6 py-3 bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800">
            <button 
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition"
            >
              {selectedTests.length === repo.testCases.length ? "Deselect All" : "Select All"}
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <select 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1.5 rounded border border-zinc-700 outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1.5 rounded border border-zinc-700 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1.5 rounded border border-zinc-700 outline-none"
              >
                <option value="all">All Types</option>
                <option value="UI">UI</option>
                <option value="API">API</option>
                <option value="Authentication">Authentication</option>
                <option value="Navigation">Navigation</option>
                <option value="Form">Form</option>
              </select>
            </div>
          </div>
        )}
        {repo.testCases?.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            No test cases found. Generate tests to get started.
          </div>
        ) : (
          repo.testCases?.filter((tc: any) => {
            if (filterPriority !== "all" && tc.priority !== filterPriority) return false;
            if (filterStatus !== "all" && tc.status !== filterStatus) return false;
            if (filterType !== "all" && tc.type !== filterType) return false;
            return true;
          }).map((tc: any) => (
            <TestCaseRow 
              key={tc.id} 
              testCase={tc} 
              isSelected={selectedTests.includes(tc.id)}
              onToggle={() => toggleTestSelection(tc.id)}
              onUpdate={onUpdate}
              globalInstruction={repo.globalInstruction}
              knownIssues={repo.knownIssues}
            />
          ))
        )}
      </div>
    </div>
  );
}
