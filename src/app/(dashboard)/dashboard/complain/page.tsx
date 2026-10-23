"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Clock, IndianRupee, MessageSquareWarning, RotateCcw, Undo2 } from "lucide-react";
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
} from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import { useComplaints } from "@/hooks/useComplaints";
import type { Complaint } from "@/services/complaint.service";

const helper = createColumnHelper<Complaint>();

const STATUSES = ["PENDING", "RESOLVED", "REJECTED"];

const columns = [
  helper.accessor("createdAt", {
    header: "Complaint Date",
    cell: (i) => <span className="whitespace-nowrap">{formatDateTime(i.getValue())}</span>,
  }),
  helper.display({
    id: "recharge",
    header: "Operator / Mobile",
    cell: (i) => {
      const r = i.row.original.recharge;
      return (
        <div className="flex items-center gap-3">
          <OperatorLogo name={r?.operator?.name} imageUrl={r?.operator?.image_url} />
          <div>
            <p className="font-semibold">{r?.mobile ?? "—"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{r?.operator?.name}</p>
          </div>
        </div>
      );
    },
  }),
  helper.display({
    id: "rechargeStatus",
    header: "Recharge",
    cell: (i) => {
      const r = i.row.original.recharge;
      return (
        <div className="text-xs">
          <StatusBadge status={r?.status} />
          {r?.createdAt && <p className="mt-1 whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDateTime(r.createdAt)}</p>}
        </div>
      );
    },
  }),
  helper.accessor("amount", {
    header: "Amount",
    cell: (i) => (
      <div className="whitespace-nowrap">
        <p className="font-semibold">{inr(i.getValue())}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Net {inr(i.row.original.net_charge)}</p>
      </div>
    ),
  }),
  helper.accessor("hold_amount", {
    header: "Hold / Refund",
    cell: (i) => (
      <div className="whitespace-nowrap text-xs">
        <p className="text-amber-600 dark:text-amber-400">Hold {inr(i.getValue())}</p>
        <p className="text-emerald-600 dark:text-emerald-400">Refund {inr(i.row.original.refund_amount)}</p>
      </div>
    ),
  }),
  helper.accessor("message", {
    header: "Message",
    cell: (i) => (
      <p className="max-w-[220px] truncate" title={i.getValue() ?? ""}>
        {i.getValue() || "—"}
      </p>
    ),
  }),
  helper.accessor("status", {
    header: "Status",
    cell: (i) => {
      const c = i.row.original;
      return (
        <div>
          <StatusBadge status={i.getValue()} />
          {c.admin_remark && (
            <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400" title={c.admin_remark}>
              {c.admin_remark}
            </p>
          )}
          {c.resolved_at && <p className="mt-1 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">{formatDateTime(c.resolved_at)}</p>}
        </div>
      );
    },
  }),
  helper.accessor("ticket_id", {
    header: "Ticket",
    cell: (i) => <span className="font-mono text-xs">{i.getValue() ?? "—"}</span>,
  }),
];

export default function ComplainPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading, isError, isFetching, refetch } = useComplaints({ as: "buyer", page, limit, status });
  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;

  // Summary current page ke data se
  const summary = useMemo(() => {
    let hold = 0;
    let refund = 0;
    for (const c of rows) {
      if (c.status === "PENDING") hold += Number(c.hold_amount) || 0;
      refund += Number(c.refund_amount) || 0;
    }
    return { hold, refund };
  }, [rows]);

  return (
    <div className="space-y-6">
      <PageHeader icon={<MessageSquareWarning className="size-5" />} title="Complain" subtitle="Aapki (buyer) ki hui saari complaints" />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={<MessageSquareWarning className="size-5" />} label="Total complaints" value={isLoading ? "—" : total} />
        <SummaryCard
          icon={<Clock className="size-5" />}
          label="Hold amount"
          value={isLoading ? "—" : <span className="text-amber-600 dark:text-amber-400">{inr(summary.hold)}</span>}
          hint="Pending, is page par"
        />
        <SummaryCard
          icon={<Undo2 className="size-5" />}
          label="Refund mila"
          value={isLoading ? "—" : <span className="text-emerald-600 dark:text-emerald-400">{inr(summary.refund)}</span>}
          hint="Is page par"
        />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <Field label="Status">
            <select
              className={fieldCls}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStatus("");
              setPage(1);
            }}
          >
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>

        <div className={cn("p-1 transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <SkeletonRows rows={Math.min(limit, 8)} />
          ) : isError && !data ? (
            <ErrorBox what="Complaints" onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(r) => r.id} emptyText="Koi complaint nahi mili" />
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
