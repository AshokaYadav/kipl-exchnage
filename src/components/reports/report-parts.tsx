"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ♻️ History / daybook pages ke common tukde

export const PAGE_SIZES = [10, 20, 50];

export const inr = (n: number | string | null | undefined) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Local date → "YYYY-MM-DD" (toISOString UTC mein badal deta hai, isliye nahi)
export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Default range: mahine ki 1 tareekh se aaj tak
export const monthStart = () => {
  const d = new Date();
  return ymd(new Date(d.getFullYear(), d.getMonth(), 1));
};
export const today = () => ymd(new Date());

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const fieldCls =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:opacity-60 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-500/20";

export function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("block w-full sm:w-44", className)}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

const badge = "rounded-md px-2 py-0.5 text-xs font-semibold";

export function StatusBadge({ status }: { status: string }) {
  // Backend kabhi "PENDIND" bhej deta hai — usko bhi PENDING maano
  const s = status?.toUpperCase().startsWith("PEND") ? "PENDING" : status?.toUpperCase();
  const tone =
    s === "SUCCESS" || s === "APPROVED" || s === "RESOLVED"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : s === "FAILED" || s === "REJECTED"
        ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
        : s === "PENDING"
          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
          : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
  return <span className={cn(badge, tone)}>{s || "—"}</span>;
}

export function OperatorLogo({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className="size-8 shrink-0 rounded-full border border-slate-200 bg-white object-contain dark:border-white/10" />;
  }
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">
      {name?.charAt(0).toUpperCase() || "?"}
    </span>
  );
}

export function PageHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">{icon}</span>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

export function SummaryCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate text-xl font-extrabold">{value}</p>
        {hint && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-white/5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="size-8 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
          <div className="h-4 flex-1 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  limit,
  total,
  busy,
  onPage,
  onLimit,
}: {
  page: number;
  limit: number;
  total: number;
  busy?: boolean;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm dark:border-white/10">
      <p className="text-slate-500 dark:text-slate-400">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          Rows per page
          <select
            className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-white/15 dark:bg-slate-900 dark:text-white"
            value={limit}
            onChange={(e) => onLimit(Number(e.target.value))}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <Button type="button" variant="outline" className="h-9 px-3" disabled={page <= 1 || busy} onClick={() => onPage(Math.max(1, page - 1))}>
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button type="button" variant="outline" className="h-9 px-3" disabled={page >= totalPages || busy} onClick={() => onPage(page + 1)}>
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ErrorBox({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <div className="p-5 text-sm text-red-600 dark:text-red-300">
      {what} load nahi hui.{" "}
      <button onClick={onRetry} className="font-semibold underline">Retry</button>
    </div>
  );
}
