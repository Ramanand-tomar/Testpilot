"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Github, CheckCircle2, AlertTriangle, ShieldAlert, Loader2, Save, User } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useToast } from "@/lib/use-toast";
import { useEffect } from "react";
import { Bell } from "lucide-react";

interface SettingsClientProps {
  dbUser: {
    name: string;
    email: string;
    githubConnected: boolean;
  };
  githubUsername: string | null;
}

export default function SettingsClient({ dbUser, githubUsername }: SettingsClientProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();

  // Profile Form State
  const [displayName, setDisplayName] = useState(dbUser.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { addToast } = useToast();

  // GitHub State
  const [githubConnected, setGithubConnected] = useState(dbUser.githubConnected);
  const [githubUser, setGithubUser] = useState(githubUsername);
  const [disconnectingGithub, setDisconnectingGithub] = useState(false);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Notification State
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [notifyOn, setNotifyOn] = useState("all");
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setEmailEnabled(data.emailEnabled);
        setSlackWebhookUrl(data.slackWebhookUrl || "");
        setNotifyOn(data.notifyOn || "all");
      })
      .catch(console.error);
  }, []);

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotifications(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailEnabled, slackWebhookUrl, notifyOn }),
      });
      if (res.ok) {
        addToast("Notification settings saved", "success");
      } else {
        addToast("Failed to save notifications", "error");
      }
    } catch (err) {
      addToast("Failed to save notifications", "error");
    } finally {
      setSavingNotifications(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        addToast("Settings saved successfully", "success");
        setTimeout(() => setSaveSuccess(false), 3000);
        router.refresh();
      } else {
        const errText = await res.text();
        addToast(`Failed to save profile: ${errText}`, "error");
      }
    } catch (err) {
      console.error("Profile save error", err);
      addToast("Failed to save profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDisconnectGithub = async () => {
    setDisconnectingGithub(true);
    try {
      const res = await fetch("/api/github/disconnect", { method: "DELETE" });
      if (res.ok) {
        setGithubConnected(false);
        setGithubUser(null);
        addToast("GitHub account disconnected", "info");
        router.refresh();
      } else {
        console.error("Failed to disconnect GitHub");
        addToast("Failed to disconnect GitHub", "error");
      }
    } catch (err) {
      console.error("GitHub disconnect error", err);
      addToast("Failed to disconnect GitHub", "error");
    } finally {
      setDisconnectingGithub(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setDeletingAccount(true);

    try {
      // 1. Delete user data from Neon Database
      const res = await fetch("/api/user", { method: "DELETE" });
      
      if (res.ok) {
        // 2. Delete user account from Clerk (client-side)
        if (clerkUser) {
          await clerkUser.delete();
        }
        
        // 3. Redirect back to landing page
        window.location.href = "/";
      } else {
        const errText = await res.text();
        addToast(`Account deletion failed: ${errText}`, "error");
        setDeletingAccount(false);
      }
    } catch (err) {
      console.error("Failed to delete user account", err);
      addToast("Failed to delete user account", "error");
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage profile information, connected logins, and security preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Section 1: User Profile */}
        <form onSubmit={handleSaveProfile} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-sm transition hover:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-3">
            <User className="w-5 h-5 text-indigo-400" /> User Profile
          </h3>

          <div className="flex items-center gap-5 flex-wrap">
            {/* Avatar Circle */}
            <div className="w-16 h-16 rounded-full bg-indigo-650 text-white font-bold text-xl flex items-center justify-center border border-indigo-500/30 shadow-md">
              {getInitials(displayName || dbUser.email)}
            </div>

            <div className="flex-1 min-w-[200px] space-y-1">
              <p className="text-sm font-semibold text-zinc-300">Avatar Image</p>
              <p className="text-xs text-zinc-500">Avatar is automatically pulled from your Clerk account profile image.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter full name..."
                required
                className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider select-none">Email Address</label>
              <div className="w-full bg-zinc-950 border border-zinc-850 text-zinc-500 rounded-xl px-4 py-3 text-sm select-all cursor-not-allowed">
                {dbUser.email}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
            {saveSuccess ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
              </span>
            ) : (
              <span className="text-xs text-zinc-500">Updates will apply to your dashboard workspace header.</span>
            )}
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Profile
            </button>
          </div>
        </form>

        {/* Section 2: GitHub Integration */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm transition hover:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-3">
            <Github className="w-5 h-5 text-indigo-400" /> GitHub Authentication
          </h3>

          <div className="border border-zinc-800 bg-zinc-950/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-zinc-200">Repository Import Integration</span>
                {githubConnected ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">
                    Connected as @{githubUser || "username"}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-zinc-850 text-zinc-500 border border-zinc-800">
                    Disconnected
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 max-w-xl">
                Integrates repository cloning and branch retrieval. Necessary to fetch codebase files and initialize test suites.
              </p>
            </div>

            <div>
              {githubConnected ? (
                <button
                  onClick={handleDisconnectGithub}
                  disabled={disconnectingGithub}
                  className="px-3.5 py-1.5 bg-red-950/25 hover:bg-red-900/30 text-red-450 hover:text-red-400 rounded-xl text-xs font-semibold border border-red-900/30 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {disconnectingGithub ? "Disconnecting..." : "Disconnect GitHub"}
                </button>
              ) : (
                <a
                  href="/api/github/connect"
                  className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition shadow-md inline-flex items-center"
                >
                  Connect GitHub
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Section 2.5: Notifications */}
        <form onSubmit={handleSaveNotifications} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-sm transition hover:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-200 flex items-center gap-2 border-b border-zinc-850 pb-3">
            <Bell className="w-5 h-5 text-indigo-400" /> Notifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                />
                <div>
                  <div className="text-sm font-semibold text-zinc-300">Email Notifications</div>
                  <div className="text-xs text-zinc-500">Receive run reports via email</div>
                </div>
              </label>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Notify On</label>
                <select
                  value={notifyOn}
                  onChange={(e) => setNotifyOn(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition"
                >
                  <option value="all">All Runs</option>
                  <option value="failures_only">Failures Only</option>
                  <option value="scheduled_only">Scheduled Runs Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Slack Webhook URL</label>
              <input
                type="url"
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition"
              />
              <p className="text-xs text-zinc-500">Leave blank to disable Slack notifications.</p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-zinc-800/60">
            <button
              type="submit"
              disabled={savingNotifications}
              className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {savingNotifications ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Notifications
            </button>
          </div>
        </form>

        {/* Section 3: Danger Zone */}
        <div className="bg-zinc-900 border border-red-950/40 rounded-2xl p-6 space-y-4 shadow-sm transition hover:border-red-900/30 bg-red-950/[0.01]">
          <h3 className="text-lg font-semibold text-rose-450 flex items-center gap-2 border-b border-red-950/40 pb-3">
            <ShieldAlert className="w-5 h-5" /> Danger Zone
          </h3>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-300">Delete Account</p>
              <p className="text-xs text-zinc-500 max-w-xl">
                Permanently delete your profile, credit balance, registered repositories, and all recorded test runs. This operation is irreversible.
              </p>
            </div>

            <Dialog.Root open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <Dialog.Trigger asChild>
                <button className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 hover:text-rose-450 rounded-xl text-xs font-semibold border border-rose-500/25 transition cursor-pointer shadow-sm">
                  Delete Account
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-red-950/50 rounded-2xl shadow-2xl z-50 p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-450 self-start">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <Dialog.Title className="text-lg font-bold text-zinc-100">Delete Account?</Dialog.Title>
                      <Dialog.Description className="text-xs text-zinc-400 leading-relaxed">
                        Are you sure you want to delete your account? This will permanently wipe all repositories, test logs, and remaining credit tokens from our servers.
                      </Dialog.Description>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Type <span className="text-rose-450">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type DELETE..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-rose-500/50 transition"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-zinc-900">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold transition"
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={confirmText !== "DELETE" || deletingAccount}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-550 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {deletingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Confirm Deletion
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
