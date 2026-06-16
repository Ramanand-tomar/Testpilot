"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function AddRepoDialog({ githubConnected, onAdded }: { githubConnected: boolean, onAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  const [targetDomain, setTargetDomain] = useState("http://localhost:3000");
  const [globalInstruction, setGlobalInstruction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRepos = repos.filter(r => r.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

  const fetchRepos = async () => {
    if (!githubConnected) return;
    setLoadingRepos(true);
    const res = await fetch('/api/github/repos');
    if (res.ok) {
      setRepos(await res.json());
    }
    setLoadingRepos(false);
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && repos.length === 0) fetchRepos();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo) return;
    setIsSubmitting(true);
    const res = await fetch('/api/repositories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repo_id: selectedRepo.id,
        full_name: selectedRepo.full_name,
        html_url: selectedRepo.html_url,
        description: selectedRepo.description,
        language: selectedRepo.language,
        default_branch: selectedRepo.default_branch,
        target_domain: targetDomain,
        global_instruction: globalInstruction
      })
    });
    setIsSubmitting(false);
    if (res.ok) {
      setIsOpen(false);
      onAdded();
      setSelectedRepo(null);
      setGlobalInstruction("");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpen}>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-md text-sm font-semibold transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Repo
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 p-6 flex flex-col max-h-[85vh]">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-zinc-100">Add Repository</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-zinc-400 hover:text-zinc-100"><X className="w-5 h-5" /></button>
            </Dialog.Close>
          </div>

          {!githubConnected ? (
            <div className="text-center py-10">
              <p className="text-zinc-400 mb-6">You need to connect your GitHub account to add repositories.</p>
              <a href="/api/github/connect" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition inline-flex items-center gap-2">
                Connect GitHub
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Select Repository</label>
                  <input 
                    type="text" 
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 mb-2"
                  />
                  {loadingRepos ? (
                    <div className="flex justify-center p-4 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border border-zinc-800 rounded-lg bg-zinc-900/50">
                      {filteredRepos.map(r => (
                        <div 
                          key={r.id} 
                          onClick={() => setSelectedRepo(r)}
                          className={`p-3 rounded-md cursor-pointer border transition ${selectedRepo?.id === r.id ? 'bg-indigo-600/10 border-indigo-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                        >
                          <p className="text-sm font-medium text-zinc-100">{r.full_name}</p>
                          {r.description && <p className="text-xs text-zinc-500 mt-1 truncate">{r.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Target Domain</label>
                  <input 
                    type="url" 
                    value={targetDomain}
                    onChange={e => setTargetDomain(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Global Instructions (Optional)</label>
                  <textarea 
                    value={globalInstruction}
                    onChange={e => setGlobalInstruction(e.target.value)}
                    placeholder="e.g. Test user credentials: user@example.com / password123"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500 min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md text-sm font-medium transition">
                    Cancel
                  </button>
                </Dialog.Close>
                <button 
                  type="submit" 
                  disabled={!selectedRepo || isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Repository
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
