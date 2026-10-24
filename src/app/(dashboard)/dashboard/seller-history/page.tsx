"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { HandCoins, IndianRupee, Layers, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  ErrorBox,
  Field,
  OperatorLogo,
  PageHeader,
  Pagination,
  SkeletonRows,
  StatusBadge,
  SummaryCard,
  fieldCls,
  inr,
  monthStart,
  today,
} from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import { useSellerHistory } from "@/hooks/useHistory";
import type { SellerHistoryRow } from "@/services/history.service";

const helper = createColumnHelper<SellerHistoryRow>();

const right = (label: string) => <span className="block text-right">{label}</span>;

const columns = [
  helper.accessor("date", {
    header: "Date",
    cell: (i) => {
      const d = new Date(i.getValue());
      return (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-slate-900 dark:text-white">
            {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      );
    },
  }),
  helper.display({
    id: "operator",
    header: "Operator / Mobile",
    cell: (i) => {
      const r = i.row.original.recharge;
      return (
        <div className="flex items-center gap-3">
          <OperatorLogo name={r?.operator?.name} imageUrl={r?.operator?.image_url || null} />
          <div>
            <p className="font-bold tracking-wide text-slate-900 dark:text-white">{r?.mobile ?? "—"}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {r?.operator?.name}
              {r?.circle?.name && ` · ${r.circle.name}`}
            </p>
          </div>
        </div>
      );
    },
  }),
  helper.display({
    id: "api",
    header: "API",
    cell: (i) => (
      <span className="inline-flex whitespace-nowrap rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">
        {i.row.original.api?.name ?? "—"}
      </span>
    ),
  }),
  helper.accessor("amount", {
    header: () => right("Amount"),
    cell: (i) => <p className="text-right font-bold tabular-nums text-slate-900 dark:text-white">{inr(i.getValue())}</p>,
  }),
  helper.accessor("margin_percent", {
    header: () => right("Margin"),
    cell: (i) => (
      <div className="text-right">
        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          {i.getValue()}%
        </span>
        <p className="mt-0.5 text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">{inr(i.row.original.margin_amount)}</p>
      </div>
    ),
  }),
  helper.accessor("payout", {
    header: () => right("Payout"),
    cell: (i) => <p className="text-right font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">{inr(i.getValue())}</p>,
  }),
  helper.accessor("status", {
    header: "Status",
    cell: (i) => <StatusBadge status={i.getValue()} />,
  }),
  helper.display({
    id: "ref",
    header: "Order / Ref",
    cell: (i) => {
      const r = i.row.original.recharge;
      return (
        <div className="space-y-0.5 text-xs">
          <p className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-800 dark:bg-white/10 dark:text-slate-100">
            {r?.order_id ?? "—"}
          </p>
          <p className="text-slate-500 dark:text-slate-400">{r?.client_ref ?? "—"}</p>
          {r?.op_ref && <p className="text-slate-500 dark:text-slate-400">Op: {r.op_ref}</p>}
        </div>
      );
    },
  }),
];

export default function SellerHistoryPage() {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, isFetching, refetch } = useSellerHistory({ page, limit, from, to });
  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;

  // Summary current page ke data se
  const summary = useMemo(() => {
    let payout = 0;
    let margin = 0;
    for (const r of rows) {
      if (r.status !== "SUCCESS") continue;
      payout += r.payout || 0;
      margin += r.margin_amount || 0;
    }
    return { payout, margin };
  }, [rows]);

  const reset = () => {
    setFrom(monthStart());
    setTo(today());
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<HandCoins className="size-5" />} title="Seller History" subtitle="Aapki APIs se hue recharges aur payout" />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={<Layers className="size-5" />} label="Total entries" value={isLoading ? "—" : total} />
        <SummaryCard icon={<IndianRupee className="size-5" />} label="Payout" value={isLoading ? "—" : inr(summary.payout)} hint="Is page par" />
        <SummaryCard
          icon={<TrendingUp className="size-5" />}
          label="Margin diya"
          value={isLoading ? "—" : <span className="text-emerald-600 dark:text-emerald-400">{inr(summary.margin)}</span>}
          hint="Is page par"
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <Field label="From">
            <input
              type="date"
              className={fieldCls}
              value={from}
              max={to}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              className={fieldCls}
              value={to}
              min={from}
              max={today()}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
            />
          </Field>
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>

        <div className={cn("p-4 transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <SkeletonRows rows={Math.min(limit, 8)} />
          ) : isError && !data ? (
            <ErrorBox what="Seller history" onRetry={() => refetch()} />
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(r) => r.id}
              emptyText="Is range mein koi entry nahi hai"
              bordered
              className="max-h-[max(320px,calc(100vh-24rem))]"
            />
          )}
        </div>

        <Pagination
          page={page}
          limit={limit}
          total={total}
          busy={isFetching}
          onPage={setPage}
          onLimit={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </section>
    </div>
  );
}
