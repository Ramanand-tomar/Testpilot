"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Download, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/lib/use-toast';

export default function AiReportModal({ repo }: { repo: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/repositories/${repo.id}/report`);
      if (res.ok) {
        setReport(await res.text());
      } else {
        addToast("Failed to generate AI report", "error");
      }
    } catch (e) {
      addToast("Error fetching AI report", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchReport();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    addToast("Copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${repo.fullName.replace('/', '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpen}>
      <Dialog.Trigger asChild>
        <button
          className="px-4 py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 border border-indigo-500/20 rounded-md text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          title="View AI-Friendly Test Report"
        >
          <Sparkles className="w-4 h-4" />
          AI Report
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 p-6 flex flex-col h-[85vh]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-semibold text-zinc-100">AI Testing Report</Dialog.Title>
                <Dialog.Description className="text-sm text-zinc-400 mt-0.5">
                  Generated markdown report optimized for AI coding agents.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="text-zinc-400 hover:text-zinc-100 transition cursor-pointer p-2 rounded-md hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-y-auto relative font-mono text-sm text-zinc-300 shadow-inner">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p>Generating comprehensive AI report...</p>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{report}</pre>
            )}
          </div>
          
          <div className="mt-6 flex justify-between items-center pt-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-500">
              Pass this report to agents like Cursor or GitHub Copilot to help fix bugs.
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCopy}
                disabled={isLoading || !report}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md text-sm font-semibold transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
              <button 
                onClick={handleDownload}
                disabled={isLoading || !report}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export .md
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
