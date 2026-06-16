"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function EditTestDialog({ testCase, onClose, onUpdate }: { testCase: any, onClose: () => void, onUpdate: () => void }) {
  const [title, setTitle] = useState(testCase.title || "");
  const [description, setDescription] = useState(testCase.description || "");
  const [targetRoute, setTargetRoute] = useState(testCase.targetRoute || "");
  const [expectedResult, setExpectedResult] = useState(testCase.expectedResult || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await fetch(`/api/test-cases/${testCase.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, target_route: targetRoute, expected_result: expectedResult })
    });
    setIsSaving(false);
    if (res.ok) {
      onUpdate();
      onClose();
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold text-zinc-100">Edit Test Case</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-zinc-400 hover:text-zinc-100"><X className="w-5 h-5" /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Title</label>
              <input 
                type="text" 
                value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Target Route</label>
              <input 
                type="text" 
                value={targetRoute} onChange={e => setTargetRoute(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
              <textarea 
                value={description} onChange={e => setDescription(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:border-indigo-500 outline-none h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Expected Result</label>
              <textarea 
                value={expectedResult} onChange={e => setExpectedResult(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-zinc-100 focus:border-indigo-500 outline-none h-20"
              />
            </div>
            
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md text-sm font-medium">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
