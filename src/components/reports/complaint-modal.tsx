"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inr } from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import { useCreateComplaint } from "@/hooks/useComplaints";
import type { BuyerRecharge } from "@/services/history.service";

const MAX_LEN = 500;

// Ready-made messages — select karte hi note mein bhar jaata hai
const ISSUE_TYPES = [
  "Recharge Not Success",
  "Not Added to Customer. Please Refund",
  "Please Provide Correct Opid",
  "Invalid Refill Amount Need Refund",
  "Please ReCheck and update status ASAP",
  "Please Re-Check Recharge",
  "Recharged Operator is Differ from Original Operator",
];

const label = "text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500";

// 📝 Recharge par complaint — issue type chuno ya khud likho
export function ComplaintModal({ recharge, onClose }: { recharge: BuyerRecharge; onClose: () => void }) {
  const [issue, setIssue] = useState(ISSUE_TYPES[0]);
  const [message, setMessage] = useState(ISSUE_TYPES[0]);
  const create = useCreateComplaint(onClose);
  const trimmed = message.trim();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pick = (type: string) => {
    setIssue(type);
    setMessage(type);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed || create.isPending) return;
    create.mutate({ recharge_id: recharge.id, message: trimmed });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-b from-red-50 to-white px-6 py-4 dark:from-red-500/10 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Raise Complaint</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Report an issue regarding this transaction</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          {/* Recharge ki details */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="min-w-0">
              <p className={label}>Txn ID</p>
              <p className="mt-1 truncate font-mono text-sm font-semibold" title={recharge.api_txn_id ?? undefined}>
                {recharge.api_txn_id ?? recharge.clientRefNo ?? "—"}
              </p>
            </div>
            <div>
              <p className={label}>Mobile</p>
              <p className="mt-1 font-semibold">{recharge.mobile}</p>
            </div>
            <div>
              <p className={label}>Operator</p>
              <span className="mt-1 inline-block rounded-lg bg-red-50 px-2.5 py-0.5 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
                {recharge.operator?.name ?? "—"}
              </span>
            </div>
            <div>
              <p className={label}>Amount</p>
              <p className="mt-1 font-semibold">{inr(Number(recharge.price))}</p>
            </div>
          </div>

          {/* Issue type chips */}
          <div>
            <p className={cn(label, "mb-2.5")}>Select Issue Type</p>
            <div className="flex flex-wrap gap-2">
              {ISSUE_TYPES.map((type) => {
                const active = issue === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => pick(type)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm transition",
                      active
                        ? "border-red-600 bg-red-600 font-semibold text-white shadow-md shadow-red-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50 dark:border-white/15 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-red-500/10",
                    )}
                  >
                    {active && <Check className="size-4" />}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className={cn(label, "mb-2.5 block")}>Complaint Note</span>
            <textarea
              rows={4}
              maxLength={MAX_LEN}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Problem likhiye… jaise: Recharge nahi mila"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-red-500/20"
            />
            <span className="mt-1 block text-right text-xs text-slate-500 dark:text-slate-400">
              {message.length}/{MAX_LEN}
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            loading={create.isPending}
            disabled={!trimmed || create.isPending}
            className="bg-red-600! shadow-red-600/20! hover:bg-red-700!"
          >
            Submit Complaint
          </Button>
        </div>
      </form>
    </div>
  );
}
