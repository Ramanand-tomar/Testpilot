"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { LogOut, Settings, CreditCard } from "lucide-react";

export default function Topbar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get title from path
  let title = "Overview";
  if (pathname.startsWith("/dashboard/repositories")) title = "Repositories";
  else if (pathname.startsWith("/dashboard/billing")) title = "Billing";
  else if (pathname.startsWith("/dashboard/settings")) title = "Settings";

  const getInitials = (name: string) => {
    return name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950 px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">{title}</h2>
      
      <div className="flex items-center gap-4">
        {/* Credits Pill */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all duration-150 ${
          user.credits < 100 
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_-3px_rgba(245,158,11,0.2)]" 
            : "bg-zinc-900 text-zinc-300 border-zinc-800"
        }`}>
          {user.credits} Credits
        </div>

        {/* User Avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center cursor-pointer transition select-none outline-none border border-indigo-500/30 shadow-md"
          >
            {getInitials(user.name)}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-850 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-zinc-805/40">
                <p className="text-sm font-semibold text-zinc-100 truncate">{user.name}</p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
              </div>
              
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition"
                >
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition"
                >
                  <CreditCard className="w-4 h-4" /> Billing
                </Link>
              </div>

              <div className="border-t border-zinc-805/45 py-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-450 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-left font-medium"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
