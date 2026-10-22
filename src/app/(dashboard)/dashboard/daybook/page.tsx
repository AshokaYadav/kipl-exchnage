"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { BookOpen, IndianRupee, Layers, RotateCcw, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  ErrorBox,
  Field,
  PageHeader,
  SkeletonRows,
  SummaryCard,
  fieldCls,
  formatDate,
  inr,
  today,
  ymd,
} from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import { useBuyerDaybook } from "@/hooks/useHistory";
import type { DaybookRow } from "@/services/history.service";

const helper = createColumnHelper<DaybookRow>();

// Default: pichhle 7 din
const weekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return ymd(d);
};

const money = (n: number, tone?: string) => (
  <span className={cn("whitespace-nowrap", n === 0 ? "text-slate-400 dark:text-slate-500" : tone)}>{inr(n)}</span>
);

const columns = [
  helper.accessor("date", {
    header: "Date",
    cell: (i) => <span className="whitespace-nowrap font-semibold">{formatDate(i.getValue())}</span>,
  }),
  helper.accessor("opening_balance", { header: "Opening", cell: (i) => money(i.getValue()) }),
  helper.accessor("wallet_topup", { header: "Topup", cell: (i) => money(i.getValue(), "text-emerald-600 dark:text-emerald-400") }),
  helper.accessor("recharge_debit", { header: "Recharge Debit", cell: (i) => money(i.getValue(), "text-red-600 dark:text-red-400") }),
  helper.accessor("refund", { header: "Refund", cell: (i) => money(i.getValue(), "text-emerald-600 dark:text-emerald-400") }),
  helper.accessor("margin_earned", { header: "Margin", cell: (i) => money(i.getValue(), "text-emerald-600 dark:text-emerald-400") }),
  helper.accessor("other", { header: "Other", cell: (i) => money(i.getValue()) }),
  helper.display({
    id: "recharges",
    header: "Recharges",
    cell: (i) => {
      const r = i.row.original.recharges;
      return (
        <div className="whitespace-nowrap text-xs">
          <p className="font-semibold">{r.total} total</p>
          <p>
            <span className="text-emerald-600 dark:text-emerald-400">{r.success} ✓</span>
            {" · "}
            <span className="text-amber-600 dark:text-amber-400">{r.pending} ⏳</span>
            {" · "}
            <span className="text-red-600 dark:text-red-400">{r.failed} ✗</span>
          </p>
        </div>
      );
    },
  }),
  helper.accessor("net_spend", { header: "Net Spend", cell: (i) => <span className="font-semibold">{money(i.getValue())}</span> }),
  helper.accessor("closing_balance", { header: "Closing", cell: (i) => <span className="font-semibold">{inr(i.getValue())}</span> }),
];

export default function DaybookPage() {
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);

  const { data, isLoading, isError, isFetching, refetch } = useBuyerDaybook({ from, to });
  const rows = useMemo(() => data ?? [], [data]);

  // Poori range ka total
  const summary = useMemo(() => {
    let topup = 0;
    let spend = 0;
    let margin = 0;
    let recharges = 0;
    for (const r of rows) {
      topup += r.wallet_topup;
      spend += r.net_spend;
      margin += r.margin_earned;
      recharges += r.recharges.total;
    }
    return { topup, spend, margin, recharges };
  }, [rows]);

  const reset = () => {
    setFrom(weekAgo());
    setTo(today());
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<BookOpen className="size-5" />} title="Daybook" subtitle="Din-wise wallet aur recharge ka hisaab" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<Layers className="size-5" />} label="Total recharges" value={isLoading ? "—" : summary.recharges} />
        <SummaryCard icon={<IndianRupee className="size-5" />} label="Net spend" value={isLoading ? "—" : inr(summary.spend)} />
        <SummaryCard icon={<Wallet className="size-5" />} label="Wallet topup" value={isLoading ? "—" : inr(summary.topup)} />
        <SummaryCard
          icon={<TrendingUp className="size-5" />}
          label="Margin earned"
          value={isLoading ? "—" : <span className="text-emerald-600 dark:text-emerald-400">{inr(summary.margin)}</span>}
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <Field label="From">
            <input type="date" className={fieldCls} value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To">
            <input type="date" className={fieldCls} value={to} min={from} max={today()} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>

        <div className={cn("p-1 transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <SkeletonRows rows={7} />
          ) : isError && !data ? (
            <ErrorBox what="Daybook" onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(r) => r.date} emptyText="Is range mein koi entry nahi hai" />
          )}
        </div>
      </section>
    </div>
  );
}
