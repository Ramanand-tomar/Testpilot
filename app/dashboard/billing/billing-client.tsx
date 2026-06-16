"use client";

import { useState, useEffect } from "react";
import { CreditCard, Sparkles, AlertTriangle, ShieldCheck, Clock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/lib/use-toast";

interface BillingHistoryItem {
  date: string;
  description: string;
  amount: string;
  status: string;
}

interface BillingClientProps {
  dbUser: {
    plan: string;
    credits: number;
    stripeCustomerId: string | null;
  };
  renewalDate: string;
  price: string;
}

const planLimits: Record<string, { max: number; price: string; description: string }> = {
  Free: { max: 1000, price: "$0/mo", description: "Standard runner plan with limited test capacity." },
  Pro: { max: 10000, price: "$29/mo", description: "Professional tier for active developers and small teams." },
  Team: { max: 50000, price: "$99/mo", description: "Scale tier with high credit limits for automated team suites." },
};

export default function BillingClient({ dbUser, renewalDate, price }: BillingClientProps) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<BillingHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { addToast } = useToast();

  const planInfo = planLimits[dbUser.plan] || planLimits.Free;
  const percentage = Math.min(100, (dbUser.credits / planInfo.max) * 100);

  const handlePortalRedirect = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error("Billing portal URL not returned");
        }
      } else {
        const errText = await res.text();
        addToast(`Error opening customer portal: ${errText}`, "error");
      }
    } catch (err) {
      console.error("Failed to load customer portal", err);
      addToast("Failed to load customer portal", "error");
    } finally {
      setLoadingPortal(false);
    }
  };

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/billing/history");
        if (res.ok) {
          const data = await res.json();
          setInvoiceHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch billing history", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Billing & Pricing</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage subscription tiers, billing details, and verify credit statements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Plan Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden transition hover:border-zinc-700">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Tier</span>
                <h3 className="text-2xl font-bold text-zinc-100 mt-1">{dbUser.plan} Plan</h3>
              </div>
              <span className="text-xl font-bold text-zinc-150">{price !== "$0.00" ? price : planInfo.price}</span>
            </div>

            <p className="text-xs text-zinc-450 leading-relaxed">{planInfo.description}</p>

            {dbUser.plan !== "Free" && (
              <div className="pt-2 flex flex-col gap-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Renews on:</span>
                  <span className="font-semibold text-zinc-300">{renewalDate}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800/60">
            {dbUser.plan === "Free" ? (
              <div className="space-y-3">
                <Link
                  href="/pricing"
                  className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition text-center shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Upgrade to Pro Tier <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePortalRedirect}
                  disabled={loadingPortal}
                  className="w-full py-2.5 px-4 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 hover:border-zinc-700 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingPortal && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                  Manage Billing
                </button>
                <button
                  onClick={handlePortalRedirect}
                  disabled={loadingPortal}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition text-center underline bg-transparent border-0 cursor-pointer"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Credits Usage */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm transition hover:border-zinc-700">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Credit Meter</span>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1 flex items-baseline gap-2">
                {dbUser.credits.toLocaleString()}{" "}
                <span className="text-sm font-medium text-zinc-500">/ {planInfo.max.toLocaleString()} max</span>
              </h3>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-zinc-850 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    dbUser.credits < 100 ? "bg-amber-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-semibold uppercase">
                <span>0</span>
                <span>{planInfo.max.toLocaleString()} Credits</span>
              </div>
            </div>

            {dbUser.credits < 100 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2.5 items-start text-amber-400 text-xs leading-relaxed">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Low credits warning!</span> Your test executions are close to suspension. Buy additional credits now.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex gap-2.5 items-start text-zinc-450 text-xs leading-relaxed">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  Your credits are automatically refilled on each monthly renewal period. Additional runtime runs can be bought.
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-800/60">
            <Link
              href="/pricing"
              className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm font-semibold transition text-center shadow-inner flex items-center justify-center gap-1.5"
            >
              Buy More Credits
            </Link>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-800/80 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Payment History</h3>
        </div>

        <div className="overflow-x-auto">
          {loadingHistory ? (
            <div className="flex justify-center items-center py-12 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="ml-2 text-sm">Loading invoices...</span>
            </div>
          ) : invoiceHistory.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No invoices found on Stripe for this account.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/30 text-xs font-semibold uppercase text-zinc-400">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {invoiceHistory.map((invoice, idx) => (
                  <tr key={idx} className="hover:bg-zinc-850/20 transition duration-150">
                    <td className="py-3.5 px-5 text-zinc-400 whitespace-nowrap">{invoice.date}</td>
                    <td className="py-3.5 px-5 font-medium text-zinc-200">{invoice.description}</td>
                    <td className="py-3.5 px-5 font-semibold text-zinc-100">{invoice.amount}</td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          invoice.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-450 border-rose-500/20"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
