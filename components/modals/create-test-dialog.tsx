"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/lib/use-toast';

export default function CreateTestDialog({ repo, onCreated }: { repo: any, onCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { addToast } = useToast();

  const handleCreate = async () => {
    if (!description.trim()) return;
    setIsCreating(true);

    try {
      const res = await fetch(`/api/repositories/${repo.id}/create-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      if (res.ok) {
        addToast('Test case created successfully!', 'success');
        setIsOpen(false);
        setDescription("");
        onCreated();
      } else {
        const errorText = await res.text();
        addToast(errorText || 'Failed to create test case', 'error');
      }
    } catch (e) {
      addToast('An unexpected error occurred.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md text-sm font-medium transition flex items-center gap-2 border border-zinc-700">
          <Plus className="w-4 h-4" />
          Create Test
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
          
          <div className="flex justify-between items-center p-5 border-b border-zinc-800 bg-zinc-900/50">
            <div>
              <Dialog.Title className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Create Natural Language Test
              </Dialog.Title>
              <Dialog.Description className="text-sm text-zinc-400 mt-1">
                Describe the user journey. Gemini will convert it into a structured test case. (Costs 5 credits)
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="text-zinc-400 hover:text-zinc-100 transition p-2 rounded-md hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-5 space-y-4">
            <textarea
              className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 resize-none placeholder:text-zinc-600"
              placeholder="e.g. Go to /login, enter admin@test.com and password123, click Sign In, verify the dashboard loads with welcome message"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-zinc-400 hover:text-zinc-100 text-sm font-medium transition">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleCreate}
                disabled={!description.trim() || isCreating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Test
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
