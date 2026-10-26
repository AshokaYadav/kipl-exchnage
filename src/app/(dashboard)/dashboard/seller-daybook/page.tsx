"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { BookMarked, IndianRupee, Layers, RotateCcw, TrendingUp, Wallet } from "lucide-react";
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
import { useSellerDaybook } from "@/hooks/useHistory";
import type { SellerDaybookRow } from "@/services/history.service";

const helper = createColumnHelper<SellerDaybookRow>();

// Default: pichhle 7 din
const weekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return ymd(d);
};

const money = (n: number, tone?: string) => (
  <span className={cn("whitespace-nowrap", n === 0 ? "text-slate-400 dark:text-slate-500" : tone)}>{inr(n)}</span>
);

const green = "text-emerald-600 dark:text-emerald-400";
const red = "text-red-600 dark:text-red-400";
const amber = "text-amber-600 dark:text-amber-400";

const columns = [
  helper.accessor("date", {
    header: "Date",
    cell: (i) => <span className="whitespace-nowrap font-semibold">{formatDate(i.getValue())}</span>,
  }),
  helper.accessor("opening_balance", { header: "Opening", cell: (i) => money(i.getValue()) }),
  helper.accessor("payout_credit", { header: "Payout Credit", cell: (i) => money(i.getValue(), green) }),
  helper.accessor("reversal", { header: "Reversal", cell: (i) => money(i.getValue(), red) }),
  helper.accessor("margin_given", { header: "Margin Given", cell: (i) => money(i.getValue(), red) }),
  helper.display({
    id: "settlement",
    header: "Settlement",
    cell: (i) => {
      const r = i.row.original;
      return (
        <div className="whitespace-nowrap text-xs">
          <p>Hold: {money(r.settlement_hold, amber)}</p>
          <p>Refund: {money(r.settlement_refund, green)}</p>
          <p>Paid: {money(r.settlement_paid, red)}</p>
        </div>
      );
    },
  }),
  helper.display({
    id: "complaint",
    header: "Complaint",
    cell: (i) => {
      const r = i.row.original;
      return (
        <div className="whitespace-nowrap text-xs">
          <p>Hold: {money(r.complaint_hold, amber)}</p>
          <p>Release: {money(r.complaint_release, green)}</p>
          <p>Refund: {money(r.complaint_refund, red)}</p>
        </div>
      );
    },
  }),
  helper.display({
    id: "sales",
    header: "Sales",
    cell: (i) => {
      const s = i.row.original.sales;
      return (
        <div className="whitespace-nowrap text-xs">
          <p className="font-semibold">{s.total} total</p>
          <p>
            <span className={green}>{s.success} ✓</span>
            {" · "}
            <span className={amber}>{s.pending} ⏳</span>
            {" · "}
            <span className={red}>{s.failed} ✗</span>
          </p>
        </div>
      );
    },
  }),
  helper.accessor("net_earning", { header: "Net Earning", cell: (i) => <span className="font-semibold">{money(i.getValue())}</span> }),
  helper.accessor("closing_balance", { header: "Closing", cell: (i) => <span className="font-semibold">{inr(i.getValue())}</span> }),
];

export default function SellerDaybookPage() {
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const { data, isLoading, isError, isFetching, refetch } = useSellerDaybook({ from, to });
  const rows = useMemo(() => data ?? [], [data]);

  // Poori range ka total
  const summary = useMemo(() => {
    let sales = 0;
    let saleAmount = 0;
    let payout = 0;
    let earning = 0;
    for (const r of rows) {
      sales += r.sales.total;
      saleAmount += r.sales.success_amount;
      payout += r.payout_credit;
      earning += r.net_earning;
    }
    return { sales, saleAmount, payout, earning };
  }, [rows]);

  const reset = () => {
    setFrom(weekAgo());
    setTo(today());
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<BookMarked className="size-5" />} title="Seller Daybook" subtitle="Din-wise sales, payout aur settlement ka hisaab" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<Layers className="size-5" />} label="Total sales" value={isLoading ? "—" : summary.sales} />
        <SummaryCard icon={<IndianRupee className="size-5" />} label="Success amount" value={isLoading ? "—" : inr(summary.saleAmount)} />
        <SummaryCard icon={<Wallet className="size-5" />} label="Payout credit" value={isLoading ? "—" : inr(summary.payout)} />
        <SummaryCard
          icon={<TrendingUp className="size-5" />}
          label="Net earning"
          value={isLoading ? "—" : <span className={green}>{inr(summary.earning)}</span>}
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
            <ErrorBox what="Seller daybook" onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(r) => r.date} emptyText="Is range mein koi entry nahi hai" />
          )}
        </div>
      </section>
    </div>
  );
}
