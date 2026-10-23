"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { History, IndianRupee, Layers, MessageSquareWarning, RotateCcw, Search, TrendingUp } from "lucide-react";
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
  formatDateTime,
  inr,
  monthStart,
  today,
} from "@/components/reports/report-parts";
import { ComplaintModal } from "@/components/reports/complaint-modal";
import { cn } from "@/lib/utils";
import { useBuyerRecharges } from "@/hooks/useHistory";
import type { BuyerRecharge } from "@/services/history.service";

const helper = createColumnHelper<BuyerRecharge>();

const STATUSES = ["SUCCESS", "PENDING", "FAILED"];

// Complaint button ko row chahiye, isliye columns ek function se bante hain
const buildColumns = (onComplain: (r: BuyerRecharge) => void) => [
  helper.accessor("createdAt", {
    header: "Date",
    cell: (i) => <span className="whitespace-nowrap">{formatDateTime(i.getValue())}</span>,
  }),
  helper.display({
    id: "operator",
    header: "Operator / Mobile",
    cell: (i) => {
      const r = i.row.original;
      return (
        <div className="flex items-center gap-3">
          <OperatorLogo name={r.operator?.name} imageUrl={r.operator?.image_url} />
          <div>
            <p className="font-semibold">{r.mobile}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{r.operator?.name}</p>
          </div>
        </div>
      );
    },
  }),
  helper.accessor((r) => Number(r.price), {
    id: "price",
    header: "Amount",
    cell: (i) => <span className="font-semibold">{inr(i.getValue())}</span>,
  }),
  helper.accessor("margin_percent", {
    header: "Margin",
    cell: (i) => (
      <span className="text-emerald-600 dark:text-emerald-400">
        {i.getValue()}% <span className="text-xs text-slate-500 dark:text-slate-400">({inr(i.row.original.margin)})</span>
      </span>
    ),
  }),
  helper.accessor("net_charge", {
    header: "Net Charge",
    cell: (i) => <span className="font-semibold">{inr(i.getValue())}</span>,
  }),
  helper.accessor("status", {
    header: "Status",
    cell: (i) => (
      <div>
        <StatusBadge status={i.getValue()} />
        {i.row.original.msg && <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400" title={i.row.original.msg}>{i.row.original.msg}</p>}
      </div>
    ),
  }),
  helper.display({
    id: "ref",
    header: "Txn / Ref",
    cell: (i) => {
      const r = i.row.original;
      return (
        <div className="text-xs">
          <p className="font-mono">{r.api_txn_id ?? "—"}</p>
          <p className="text-slate-500 dark:text-slate-400">{r.clientRefNo ?? "—"}</p>
          {r.op_id && <p className="text-slate-500 dark:text-slate-400">Op: {r.op_id}</p>}
        </div>
      );
    },
  }),
  helper.display({
    id: "balance",
    header: "Balance",
    cell: (i) => {
      const r = i.row.original;
      return (
        <div className="whitespace-nowrap text-xs">
          <p>{inr(r.opening_balance)} → {inr(r.closing_balance)}</p>
        </div>
      );
    },
  }),
  helper.display({
    id: "action",
    header: "Action",
    cell: (i) => (
      <Button variant="outline" className="h-8 whitespace-nowrap px-3 text-xs" onClick={() => onComplain(i.row.original)}>
        <MessageSquareWarning className="size-3.5" /> Complaint
      </Button>
    ),
  }),
];

export default function RechargeHistoryPage() {
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [status, setStatus] = useState("");
  const [mobileDraft, setMobileDraft] = useState("");
  const [mobile, setMobile] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [complainFor, setComplainFor] = useState<BuyerRecharge | null>(null);
  const columns = useMemo(() => buildColumns(setComplainFor), []);

  const { data, isLoading, isError, isFetching, refetch } = useBuyerRecharges({ page, limit, status, from, to, mobile });
  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;

  // Summary current page ke data se
  const summary = useMemo(() => {
    let amount = 0;
    let margin = 0;
    for (const r of rows) {
      if (r.status !== "SUCCESS") continue;
      amount += Number(r.price) || 0;
      margin += r.margin || 0;
    }
    return { amount, margin };
  }, [rows]);

  // Filter badle toh page 1 par wapas
  const withReset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  const reset = () => {
    setFrom(monthStart());
    setTo(today());
    setStatus("");
    setMobileDraft("");
    setMobile("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<History className="size-5" />} title="Recharge History" subtitle="Aapke (buyer) saare recharges" />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={<Layers className="size-5" />} label="Total recharges" value={isLoading ? "—" : total} />
        <SummaryCard icon={<IndianRupee className="size-5" />} label="Success amount" value={isLoading ? "—" : inr(summary.amount)} hint="Is page par" />
        <SummaryCard
          icon={<TrendingUp className="size-5" />}
          label="Margin mila"
          value={isLoading ? "—" : <span className="text-emerald-600 dark:text-emerald-400">{inr(summary.margin)}</span>}
          hint="Is page par"
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <form
          className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10"
          onSubmit={(e) => {
            e.preventDefault();
            setMobile(mobileDraft.trim());
            setPage(1);
          }}
        >
          <Field label="From">
            <input type="date" className={fieldCls} value={from} max={to} onChange={(e) => withReset(setFrom)(e.target.value)} />
          </Field>
          <Field label="To">
            <input type="date" className={fieldCls} value={to} min={from} max={today()} onChange={(e) => withReset(setTo)(e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={fieldCls} value={status} onChange={(e) => withReset(setStatus)(e.target.value)}>
              <option value="">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Mobile">
            <input
              className={fieldCls}
              inputMode="numeric"
              maxLength={10}
              placeholder="10 digit mobile"
              value={mobileDraft}
              onChange={(e) => setMobileDraft(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <Button type="submit">
            <Search className="size-4" /> Search
          </Button>
          <Button type="button" variant="outline" onClick={reset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </form>

        <div className={cn("p-1 transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <SkeletonRows rows={Math.min(limit, 8)} />
          ) : isError && !data ? (
            <ErrorBox what="Recharge history" onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(r) => r.id} emptyText="Is range mein koi recharge nahi mila" />
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

      {complainFor && <ComplaintModal recharge={complainFor} onClose={() => setComplainFor(null)} />}
    </div>
  );
}
