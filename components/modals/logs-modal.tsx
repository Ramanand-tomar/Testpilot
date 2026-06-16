"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, Play } from 'lucide-react';

export default function LogsModal({ testCase, onClose }: { testCase: any, onClose: () => void }) {
  const logs: string[] = testCase.logs || [];

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 flex flex-col max-h-[85vh]">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30 rounded-t-xl">
            <div>
              <Dialog.Title className="text-xl font-semibold text-zinc-100">{testCase.title}</Dialog.Title>
              <p className="text-sm text-zinc-400 mt-1">Status: <span className="uppercase text-zinc-300 font-medium">{testCase.status}</span></p>
            </div>
            <div className="flex items-center gap-4">
              {testCase.sessionUrl && (
                <a 
                  href={testCase.sessionUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md flex items-center gap-1.5 transition"
                >
                  <Play className="w-4 h-4" /> Watch Recording
                </a>
              )}
              <Dialog.Close asChild>
                <button className="text-zinc-400 hover:text-zinc-100 p-1"><X className="w-5 h-5" /></button>
              </Dialog.Close>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 font-mono text-sm bg-[#0d0d0f]">
            {logs.length === 0 ? (
              <p className="text-zinc-600 text-center py-10">No logs available.</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => {
                  let colorClass = "text-zinc-300";
                  if (log.toLowerCase().includes("error") || log.toLowerCase().includes("fail")) colorClass = "text-rose-400";
                  else if (log.toLowerCase().includes("success")) colorClass = "text-emerald-400";
                  
                  return (
                    <div key={i} className={`py-0.5 ${colorClass}`}>
                      <span className="text-zinc-600 select-none mr-3">{String(i + 1).padStart(3, '0')}</span>
                      {log}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
