"use client";

import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, Settings, FileText } from 'lucide-react';
import EditTestDialog from './modals/edit-test-dialog';
import LogsModal from './modals/logs-modal';
import { useState } from 'react';

export default function TestCaseRow({ 
  testCase, 
  isSelected, 
  onToggle, 
  onUpdate,
  globalInstruction,
  knownIssues 
}: { 
  testCase: any, 
  isSelected: boolean, 
  onToggle: () => void, 
  onUpdate: () => void,
  globalInstruction?: string,
  knownIssues?: string
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const statusColors: any = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    running: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    pass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    fail: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className="flex items-center px-6 py-4 hover:bg-zinc-800/50 transition">
      <div className="flex-shrink-0 mr-4">
        <Checkbox.Root 
          checked={isSelected}
          onCheckedChange={onToggle}
          className="w-5 h-5 bg-zinc-950 border border-zinc-700 rounded flex items-center justify-center data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 outline-none"
        >
          <Checkbox.Indicator>
            <Check className="w-3.5 h-3.5 text-white" />
          </Checkbox.Indicator>
        </Checkbox.Root>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-zinc-100 truncate">{testCase.title}</p>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-zinc-800 text-zinc-400">
            {testCase.type}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[testCase.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
            {testCase.status}
          </span>
          {testCase.wasHealed && (
            <span title="This test was automatically healed by AI" className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 cursor-help">
              🔧 Healed
            </span>
          )}
          {testCase.priority === 'high' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-rose-400 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> High
            </span>
          )}
          {testCase.priority === 'medium' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Medium
            </span>
          )}
          {testCase.priority === 'low' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Low
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <p className="text-sm text-zinc-500 truncate">{testCase.targetRoute}</p>
          {testCase.tags && testCase.tags.length > 0 && (
            <div className="flex items-center gap-1.5 border-l border-zinc-700 pl-2">
              {testCase.tags.map((tag: string, i: number) => (
                <span key={i} className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button 
          onClick={() => setIsLogsOpen(true)}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition"
          title="View Logs"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsEditOpen(true)}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition"
          title="Edit Test"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {isEditOpen && <EditTestDialog testCase={testCase} onClose={() => setIsEditOpen(false)} onUpdate={onUpdate} />}
      {isLogsOpen && (
        <LogsModal 
          testCase={testCase} 
          globalInstruction={globalInstruction}
          knownIssues={knownIssues}
          onClose={() => setIsLogsOpen(false)} 
        />
      )}
    </div>
  );
}
