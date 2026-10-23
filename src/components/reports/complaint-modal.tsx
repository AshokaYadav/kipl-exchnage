"use client";

import { useEffect, useState } from "react";
import { MessageSquareWarning, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperatorLogo, StatusBadge, formatDateTime, inr } from "@/components/reports/report-parts";
import { useCreateComplaint } from "@/hooks/useComplaints";
import type { BuyerRecharge } from "@/services/history.service";

const MAX_LEN = 500;

// 📝 Recharge par complaint — chhota sa inbox jahan buyer message likhe
export function ComplaintModal({ recharge, onClose }: { recharge: BuyerRecharge; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const create = useCreateComplaint(onClose);
  const trimmed = message.trim();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MessageSquareWarning className="size-5 text-brand-600" /> Raise Complaint
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Recharge ki details */}
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <OperatorLogo name={recharge.operator?.name} imageUrl={recharge.operator?.image_url} />
              <div>
                <p className="font-semibold">{recharge.mobile}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {recharge.operator?.name} · {formatDateTime(recharge.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{inr(Number(recharge.price))}</p>
              <StatusBadge status={recharge.status} />
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Message</span>
            <textarea
              autoFocus
              rows={5}
              maxLength={MAX_LEN}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Problem likhiye… jaise: Recharge nahi mila"
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-brand-500/20"
            />
            <span className="mt-1 block text-right text-xs text-slate-500 dark:text-slate-400">
              {message.length}/{MAX_LEN}
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/10">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={create.isPending} disabled={!trimmed || create.isPending}>
            Submit Complaint
          </Button>
        </div>
      </form>
    </div>
  );
}
