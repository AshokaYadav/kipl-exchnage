"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { BarChart3, ChevronLeft, ChevronRight, Layers, RotateCcw, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { useAvailableStock, useAvailableStockOptions } from "@/hooks/useAvailableStock";
import type { AvailableStockRow } from "@/services/available-stock.service";

const helper = createColumnHelper<AvailableStockRow>();

const badge = "rounded-md px-2 py-0.5 text-xs font-semibold";

const PAGE_SIZES = [10, 20, 50];

const rowId = (r: AvailableStockRow) => `${r.operator.id}-${r.circle.id ?? "all"}`;

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function formatMargin(m: AvailableStockRow["margin"]) {
  return m.min === m.max ? `${m.min}%` : `${m.min}% – ${m.max}%`;
}

function OperatorLogo({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className="size-8 shrink-0 rounded-full border border-slate-200 bg-white object-contain dark:border-white/10" />;
  }
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">
      {name.charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function LimitCell({ row }: { row: AvailableStockRow }) {
  if (row.unlimited) {
    return <span className={cn(badge, "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300")}>Unlimited</span>;
  }
  const total = row.used_limit + row.available_limit;
  const usedPct = total > 0 ? Math.min(100, (row.used_limit / total) * 100) : 0;
  return (
    <div className="min-w-[140px]">
      <p className="font-semibold">{inr(row.available_limit)} bacha</p>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${usedPct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Used {inr(row.used_limit)}</p>
    </div>
  );
}

const columns = [
  helper.display({
    id: "operator",
    header: "Operator",
    cell: (i) => {
      const r = i.row.original;
      return (
        <div className="flex items-center gap-3">
          <OperatorLogo name={r.operator.name} imageUrl={r.operator.image_url} />
          <div>
            <p className="font-semibold">{r.operator.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{r.category?.name}</p>
          </div>
        </div>
      );
    },
  }),
  helper.display({
    id: "circle",
    header: "Circle",
    cell: (i) => {
      const c = i.row.original.circle;
      return c.all ? (
        <span className={cn(badge, "bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200")}>All Circles</span>
      ) : (
        <span>{c.name}</span>
      );
    },
  }),
  helper.display({
    id: "stock",
    header: "Stock",
    cell: (i) => <span>{i.row.original.stock_count} sellers</span>,
  }),
  // Sirf margin sortable hai — max margin se
  helper.accessor((r) => r.margin.max, {
    id: "margin",
    header: "Margin",
    cell: (i) => (
      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatMargin(i.row.original.margin)}</span>
    ),
  }),
  helper.display({
    id: "amount",
    header: "Amount",
    cell: (i) => {
      const a = i.row.original.amount;
      if (a.all_amount) return <span className="text-slate-600 dark:text-slate-300">All amounts</span>;
      return (
        <span>
          {inr(a.min ?? 0)} – {inr(a.max ?? 0)}
        </span>
      );
    },
  }),
  helper.display({
    id: "limit",
    header: "Limit",
    cell: (i) => <LimitCell row={i.row.original} />,
  }),
];

const selectCls =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:opacity-60 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-500/20";

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
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

function SkeletonRows({ rows = 6 }: { rows?: number }) {
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

export default function AvailableStockPage() {
  const [operatorId, setOperatorId] = useState("");
  const [circleId, setCircleId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, isFetching, refetch } = useAvailableStock({
    operator_id: operatorId,
    circle_id: circleId,
    page,
    limit,
  });
  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;

  // TODO: operators / circles ki list API aane par dropdown options wahan se lene hain
  const optionsQuery = useAvailableStockOptions();

  const { operatorOptions, circleOptions } = useMemo(() => {
    const ops = new Map<string, string>();
    const circles = new Map<string, string>();
    for (const r of optionsQuery.data?.data ?? []) {
      ops.set(r.operator.id, r.operator.name);
      if (!r.circle.all && r.circle.id) circles.set(r.circle.id, r.circle.name);
    }
    const sort = (m: Map<string, string>) =>
      [...m].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    return { operatorOptions: sort(ops), circleOptions: sort(circles) };
  }, [optionsQuery.data]);

  

  // Summary current page ke data se
  const summary = useMemo(() => {
    let best: AvailableStockRow | null = null;
    let sellers = 0;
    for (const r of rows) {
      sellers += r.stock_count;
      if (!best || r.margin.max > best.margin.max) best = r;
    }
    return { best, sellers };
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Filter badle toh page 1 par wapas
  const changeOperator = (v: string) => {
    setOperatorId(v);
    setPage(1);
  };
  const changeCircle = (v: string) => {
    setCircleId(v);
    setPage(1);
  };
  const reset = () => {
    setOperatorId("");
    setCircleId("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
          <BarChart3 className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Available Stock</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Market mein abhi kaunsa stock mil raha hai</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={<Layers className="size-5" />} label="Total entries" value={isLoading ? "—" : total} />
        <SummaryCard
          icon={<TrendingUp className="size-5" />}
          label="Best margin"
          value={
            summary.best ? <span className="text-emerald-600 dark:text-emerald-400">{summary.best.margin.max}%</span> : "—"
          }
          hint={summary.best?.operator.name}
        />
        <SummaryCard icon={<Users className="size-5" />} label="Total sellers" value={isLoading ? "—" : summary.sellers} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <label className="block w-full sm:w-56">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Operator</span>
            <select
              className={selectCls}
              value={operatorId}
              disabled={optionsQuery.isLoading}
              onChange={(e) => changeOperator(e.target.value)}
            >
              <option value="">{optionsQuery.isLoading ? "Loading..." : "All Operators"}</option>
              {operatorOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </label>
          <label className="block w-full sm:w-56">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Circle</span>
            <select
              className={selectCls}
              value={circleId}
              disabled={optionsQuery.isLoading}
              onChange={(e) => changeCircle(e.target.value)}
            >
              <option value="">{optionsQuery.isLoading ? "Loading..." : "All Circles"}</option>
              {circleOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <Button type="button" variant="outline" onClick={reset} disabled={!operatorId && !circleId}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>

        <div className={cn("p-1 transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <SkeletonRows rows={Math.min(limit, 8)} />
          ) : isError && !data ? (
            <div className="p-5 text-sm text-red-600 dark:text-red-300">
              Available stock load nahi hua.{" "}
              <button onClick={() => refetch()} className="font-semibold underline">Retry</button>
            </div>
          ) : (
            <DataTable columns={columns} data={rows} getRowId={rowId} emptyText="Abhi koi stock available nahi hai" />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm dark:border-white/10">
          <p className="text-slate-500 dark:text-slate-400">
            Showing {start}–{end} of {total}
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              Rows per page
              <select
                className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-white/15 dark:bg-slate-900 dark:text-white"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
