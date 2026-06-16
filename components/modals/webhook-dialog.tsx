"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X, Webhook, Copy, Check, RefreshCw, Loader2, Code2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/lib/use-toast';

export default function WebhookDialog({ repo }: { repo: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [webhook, setWebhook] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  const [copiedYaml, setCopiedYaml] = useState(false);

  const fetchWebhook = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId: repo.id })
      });
      if (res.ok) {
        const data = await res.json();
        setWebhook(data.webhook);
      }
    } catch (e) {
      addToast('Failed to fetch webhook', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !webhook) {
      fetchWebhook();
    }
  }, [isOpen]);

  const handleRegenerate = async () => {
    if (!webhook) return;
    setGenerating(true);
    try {
      // Delete old
      await fetch(`/api/webhooks/${webhook.id}`, { method: 'DELETE' });
      // Generate new
      const res = await fetch('/api/webhooks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId: repo.id })
      });
      if (res.ok) {
        const data = await res.json();
        setWebhook(data.webhook);
        addToast('Webhook regenerated successfully', 'success');
      }
    } catch (e) {
      addToast('Failed to regenerate webhook', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const webhookUrl = webhook ? `${window.location.origin}/api/webhooks/trigger/${webhook.secret}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Webhook URL copied!', 'success');
  };

  const copyYamlToClipboard = () => {
    navigator.clipboard.writeText(githubActionsYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
    addToast('GitHub Action copied!', 'success');
  };

  const githubActionsYaml = `name: Trigger Tests

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger AI Testing Automation
        run: |
          curl -X POST \\
            ${webhookUrl || 'https://your-domain.com/api/webhooks/trigger/your-secret'} \\
            -H "Content-Type: application/json"
`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md text-sm font-medium transition flex items-center gap-2">
          <Webhook className="w-4 h-4" />
          CI/CD Integration
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
          
          <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50">
            <div>
              <Dialog.Title className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                <Webhook className="w-5 h-5 text-indigo-400" />
                CI/CD Webhook
              </Dialog.Title>
              <Dialog.Description className="text-sm text-zinc-400 mt-1">
                Trigger a full test run automatically from your CI/CD pipeline.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="text-zinc-400 hover:text-zinc-100 transition p-2 rounded-md hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-6">
            {loading && !webhook ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 block">Your Unique Webhook URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={webhookUrl} 
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md transition flex items-center justify-center min-w-[100px]"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-2 text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-amber-500 mt-2">
                    Keep this URL secret. Anyone with this URL can trigger test runs and consume your credits.
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/50 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-zinc-400" />
                      GitHub Actions Example
                    </h4>
                    <button 
                      onClick={copyYamlToClipboard}
                      className="text-zinc-400 hover:text-zinc-100 transition flex items-center gap-1.5 text-xs bg-zinc-800/50 hover:bg-zinc-800 px-2 py-1 rounded"
                    >
                      {copiedYaml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedYaml ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-xs text-zinc-300 font-mono leading-relaxed">
                    <code>{githubActionsYaml}</code>
                  </pre>
                </div>

                <div className="pt-6 flex justify-between items-center">
                  <div className="text-xs text-zinc-500">
                    Last triggered: {webhook?.lastTriggeredAt ? new Date(webhook.lastTriggeredAt).toLocaleString() : 'Never'}
                  </div>
                  <button 
                    onClick={handleRegenerate}
                    disabled={generating}
                    className="px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-md text-sm font-medium transition flex items-center gap-2"
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Regenerate Secret
                  </button>
                </div>
              </>
            )}
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
