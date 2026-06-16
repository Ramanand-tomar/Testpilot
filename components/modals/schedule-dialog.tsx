"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Clock, Calendar, Check, Save, Loader2, Trash2 } from "lucide-react";

export default function ScheduleDialog({
  repoId,
  schedule,
  onClose,
  onUpdate
}: {
  repoId: number;
  schedule?: any;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [isActive, setIsActive] = useState(schedule?.isActive ?? true);
  const [cronExpression, setCronExpression] = useState(schedule?.cronExpression || "0 * * * *");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const presets = [
    { label: "Every Hour", value: "0 * * * *" },
    { label: "Daily at 9 AM", value: "0 9 * * *" },
    { label: "Weekly (Mon 9 AM)", value: "0 9 * * 1" },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId, cronExpression, isActive })
      });
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/schedules/${schedule.id}`, {
        method: 'DELETE'
      });
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl z-50 p-6 flex flex-col font-sans">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Schedule Tests
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-zinc-500 hover:text-zinc-300 p-1">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Enable Schedule</h4>
                <p className="text-xs text-zinc-500 mt-1">Automatically run tests on this repository.</p>
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-indigo-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Schedule Presets */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                Run Frequency
              </label>
              <div className="grid gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setCronExpression(preset.value)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-all ${
                      cronExpression === preset.value
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                        : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50'
                    }`}
                  >
                    {preset.label}
                    {cronExpression === preset.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Cron */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Custom Cron Expression</label>
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="* * * * *"
              />
            </div>

            {/* Readonly Times */}
            {schedule && (
              <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Last Run</div>
                  <div className="text-xs text-zinc-300 mt-1">
                    {schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleString() : 'Never'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Next Run</div>
                  <div className="text-xs text-indigo-300 mt-1">
                    {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : 'Pending'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3 justify-end">
            {schedule && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all flex items-center gap-2 mr-auto disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            )}
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Schedule
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
