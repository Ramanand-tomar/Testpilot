"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GitBranch, CreditCard, Settings } from "lucide-react";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/repositories", label: "Repositories", icon: GitBranch, badge: user.repoCount },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard, badge: user.plan },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-60 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between h-full select-none flex-shrink-0">
      <div>
        {/* Logo */}
        <div className="h-14 px-6 border-b border-zinc-800/80 flex items-center gap-2.5">
          <span className="text-xl">⚡</span>
          <span className="font-bold text-zinc-100 tracking-tight">AI Testing Agent</span>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition duration-150 ${
                  isActive
                    ? "bg-zinc-900 text-indigo-400 font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-[18px] h-[18px]" />
                  {link.label}
                </div>
                {link.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800"
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Card */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/10">
        <div className="px-3 py-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800 flex flex-col">
          <p className="text-xs font-semibold text-zinc-350 truncate">{user.name}</p>
          <p className="text-[10px] text-zinc-500 truncate mt-0.5">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}
