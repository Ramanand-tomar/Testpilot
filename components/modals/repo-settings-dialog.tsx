"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, Settings, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/lib/use-toast';

export default function RepoSettingsDialog({ repo, onUpdated }: { repo: any, onUpdated: () => void }) {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [targetDomain, setTargetDomain] = useState(repo.targetDomain || "http://localhost:3000");
  const [globalInstruction, setGlobalInstruction] = useState(repo.globalInstruction || "");
  const [knownIssues, setKnownIssues] = useState(repo.knownIssues || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/repositories/${repo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_domain: targetDomain,
          global_instruction: globalInstruction,
          known_issues: knownIssues
        })
      });
      if (res.ok) {
        setIsOpen(false);
        addToast("Settings saved successfully", "success");
        onUpdated();
      } else {
        console.error("Failed to update repository settings");
        addToast("Failed to save settings", "error");
      }
    } catch (error) {
      console.error("Settings save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTargetDomain(repo.targetDomain || "http://localhost:3000");
      setGlobalInstruction(repo.globalInstruction || "");
      setKnownIssues(repo.knownIssues || "");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpen}>
      <Dialog.Trigger asChild>
        <button 
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition cursor-pointer"
          title="Repository Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 p-6 flex flex-col max-h-[85vh]">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-zinc-100">Repository Settings</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-zinc-400 hover:text-zinc-100 cursor-pointer"><X className="w-5 h-5" /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden space-y-4">
            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Target Domain</label>
                <input 
                  type="url" 
                  value={targetDomain}
                  onChange={e => setTargetDomain(e.target.value)}
                  required
                  placeholder="http://localhost:3000"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Global Instructions (Optional)</label>
                <textarea 
                  value={globalInstruction}
                  onChange={e => setGlobalInstruction(e.target.value)}
                  placeholder="e.g. Test user credentials: user@example.com / password123. Ensure all tests run with dark mode settings."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Known Issues / Where Website Fails (Optional)</label>
                <textarea 
                  value={knownIssues}
                  onChange={e => setKnownIssues(e.target.value)}
                  placeholder="e.g. The profile page requires refreshing twice. The logout button is inside the hamburger menu on mobile."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md text-sm font-semibold transition cursor-pointer">
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
