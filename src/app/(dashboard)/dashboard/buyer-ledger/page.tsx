"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowUpRight, BookText, Layers, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  ErrorBox,
  Field,
  PageHeader,
  Pagination,
  SkeletonRows,
  StatusBadge,
  SummaryCard,
  fieldCls,
  formatDateTime,
  inr,
  monthStart,
  today,
} from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import { useBuyerLedger } from "@/hooks/useHistory";
import type { BuyerLedgerRow } from "@/services/history.service";

const helper = createColumnHelper<BuyerLedgerRow>();

const TYPES = [
  { value: "RECHARGE_DEBIT", label: "Recharge Debit" },
  { value: "RECHARGE_REFUND", label: "Recharge Refund" },
  { value: "RECHARGE_COMMISSION", label: "Commission" },
  { value: "CREDIT", label: "Credit" },
];

const badge = "rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

function TypeBadge({ type }: { type: string }) {
  const tone =
    type === "RECHARGE_DEBIT"
      ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
      : type === "RECHARGE_REFUND"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        : type === "RECHARGE_COMMISSION"
          ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
          : type === "CREDIT"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300";
  return <span className={cn(badge, tone)}>{TYPES.find((t) => t.value === type)?.label ?? type}</span>;
}

// direction se sign — DEBIT hamesha minus
const signed = (r: BuyerLedgerRow) => (r.direction === "DEBIT" ? -Math.abs(r.delta) : Math.abs(r.delta));

const columns = [
  helper.accessor("date", {
    header: "Date",
    cell: (i) => <span className="whitespace-nowrap">{formatDateTime(i.getValue())}</span>,
  }),
  helper.accessor("type", {
    header: "Type",
    cell: (i) => <TypeBadge type={i.getValue()} />,
  }),
  helper.display({
    id: "recharge",
    header: "Recharge",
    cell: (i) => {
      const r = i.row.original.recharge;
      if (!r) return <span className="text-slate-400">—</span>;
      return (
        <div className="text-xs">
          <p className="font-semibold text-sm">{r.mobile}</p>
          <p className="text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {r.operator?.name} · {r.circle?.name} · {inr(r.price)}
          </p>
        </div>
      );
    },
  }),
  // Wallet mein kitna aaya / gaya
  helper.accessor("delta", {
    header: "Credit / Debit",
    cell: (i) => {
      const d = signed(i.row.original);
      return (
        <span className={cn("whitespace-nowrap font-semibold", d >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
          {d >= 0 ? "+" : "−"}
          {inr(Math.abs(d))}
        </span>
      );
    },
  }),
  helper.display({
    id: "balance",
    header: "Balance",
    cell: (i) => {
      const r = i.row.original;
      return (
        <span className="whitespace-nowrap text-xs">
          {inr(r.opening_balance)} → <span className="font-semibold">{inr(r.closing_balance)}</span>
        </span>
      );
    },
  }),
  helper.accessor("status", {
    header: "Status",
    cell: (i) => <StatusBadge status={i.getValue()} />,
  }),
  helper.accessor("msg", {
    header: "Remark",
    cell: (i) => {
      const r = i.row.original.recharge;
      return (
        <div className="max-w-[240px] text-xs">
          <p className="truncate" title={i.getValue() ?? ""}>{i.getValue() ?? "—"}</p>
          {r?.order_id && (
            <p className="truncate font-mono text-slate-500 dark:text-slate-400" title={r.order_id}>
              {r.order_id}
            </p>
          )}
        </div>
      );
    },
  }),
];

export default function BuyerLedgerPage() {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, isFetching, refetch } = useBuyerLedger({ page, limit, type, from, to });
  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;

  // Summary current page ke data se
  const summary = useMemo(() => {
    let credit = 0;
    let debit = 0;
    for (const r of rows) {
      const d = signed(r);
      if (d >= 0) credit += d;
      else debit += -d;
    }
    return { credit, debit };
  }, [rows]);

  // Filter badle toh page 1 par wapas
  const change = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPage(1);
  };

  const reset = () => {
    setFrom(monthStart());
    setTo(today());
    setType("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<BookText className="size-5" />} title="Buyer Ledger" subtitle="Buyer wallet mein har debit, refund aur commission ki entry" />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={<Layers className="size-5" />} label="Total entries" value={isLoading ? "—" : total} />
        <SummaryCard
          icon={<ArrowDownLeft className="size-5" />}
          label="Credit"
          value={isLoading ? "—" : <span className="text-emerald-600 dark:text-emerald-400">{inr(summary.credit)}</span>}
          hint="Is page par"
        />
        <SummaryCard
          icon={<ArrowUpRight className="size-5" />}
          label="Debit"
          value={isLoading ? "—" : <span className="text-red-600 dark:text-red-400">{inr(summary.debit)}</span>}
          hint="Is page par"
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <Field label="From">
            <input type="date" className={fieldCls} value={from} max={to} onChange={(e) => change(setFrom)(e.target.value)} />
          </Field>
          <Field label="To">
            <input type="date" className={fieldCls} value={to} min={from} max={today()} onChange={(e) => change(setTo)(e.target.value)} />
          </Field>
          <Field label="Type" className="sm:w-52">
            <select className={fieldCls} value={type} onChange={(e) => change(setType)(e.target.value)}>
              <option value="">All Types</option>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>

        <div className={cn("p-1 transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <SkeletonRows rows={Math.min(limit, 8)} />
          ) : isError && !data ? (
            <ErrorBox what="Buyer ledger" onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(r) => r.id} emptyText="Is range mein koi entry nahi hai" />
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
