"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface RepoSummaryProps {
  repo: {
    id: number;
    fullName: string;
    language: string | null;
    testCases?: {
      id: number;
      status: string | null;
    }[];
  };
}

export default function RepoSummaryCard({ repo }: RepoSummaryProps) {
  const router = useRouter();

  const testCases = repo.testCases || [];
  const testCount = testCases.length;
  const passedCount = testCases.filter((t) => t.status === "pass").length;
  const failedCount = testCases.filter((t) => t.status === "fail").length;

  const handleCardClick = () => {
    router.push("/dashboard/repositories");
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-4 bg-zinc-900/50 hover:bg-zinc-850/40 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between gap-6 cursor-pointer transition-all duration-200 select-none group"
    >
      <div className="flex-1 min-w-0 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-indigo-400 transition truncate max-w-[240px]">
            {repo.fullName}
          </h4>
          
          {repo.language && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-800 text-zinc-350 border border-zinc-700">
              {repo.language}
            </span>
          )}

          <span className="text-xs text-zinc-500">
            {testCount} {testCount === 1 ? "test" : "tests"}
          </span>
        </div>

        {/* Mini Pass/Fail progress bar */}
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden flex shadow-inner">
            {testCount > 0 ? (
              <>
                {passedCount > 0 && (
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${(passedCount / testCount) * 100}%` }}
                  />
                )}
                {failedCount > 0 && (
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${(failedCount / testCount) * 100}%` }}
                  />
                )}
                {testCount - passedCount - failedCount > 0 && (
                  <div className="bg-zinc-700 h-full flex-1" />
                )}
              </>
            ) : (
              <div className="bg-zinc-800 h-full w-full" />
            )}
          </div>

          <div className="flex justify-between text-[10px] font-medium text-zinc-500">
            <span>Passed: {passedCount}</span>
            <span>Failed: {failedCount}</span>
          </div>
        </div>
      </div>

      <div className="text-zinc-500 group-hover:text-zinc-350 transition-colors flex-shrink-0">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
}
