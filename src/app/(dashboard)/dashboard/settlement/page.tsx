"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Ban, Banknote, Building2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  ErrorBox,
  Field,
  PageHeader,
  Pagination,
  SkeletonRows,
  StatusBadge,
  fieldCls,
  formatDateTime,
  inr,
} from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import { SettlementBanksSection } from "@/components/settlement/settlement-banks";
import { useSettlementBanks } from "@/hooks/useSettlementBanks";
import { useCancelSettlement, useCreateSettlement, useSettlements } from "@/hooks/useSettlement";
import type { SettlementBank, SettlementRequest } from "@/services/settlement.service";

const helper = createColumnHelper<SettlementRequest>();

// TODO: backend se final status list confirm karni hai
const STATUSES = ["PENDING", "SUCCESS", "REJECTED", "CANCELLED"];

const isPending = (s: string) => s?.toUpperCase().startsWith("PEND");

function SettlementForm({ banks, banksLoading }: { banks: SettlementBank[]; banksLoading: boolean }) {
  const [bankId, setBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const create = useCreateSettlement(() => {
    setAmount("");
    setRemark("");
  });

  // Kuch na chuna ho toh default bank
  const selected = bankId || banks.find((b) => b.is_default)?.id || banks[0]?.id || "";
  const value = Number(amount);
  const valid = selected && value > 0;

  if (!banksLoading && banks.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-white/15">
        <Building2 className="size-8 text-slate-400" />
        <p className="mt-3 font-semibold">Pehle apna bank add karo</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upar &quot;Mere Banks&quot; mein bank add karo — settlement usi mein aayega</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        create.mutate({ user_bank_id: selected, amount: value, remark: remark.trim() || undefined });
      }}
    >
      <Field label="Bank" className="sm:w-full">
        <select className={fieldCls} value={selected} disabled={banksLoading} onChange={(e) => setBankId(e.target.value)} required>
          {banksLoading && <option value="">Loading...</option>}
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.bank_name} — {b.account_number}
              {b.is_default ? " (Default)" : ""}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Amount (₹)"
          name="amount"
          inputMode="decimal"
          placeholder="1000"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          required
        />
        <Input label="Remark (optional)" name="remark" value={remark} onChange={(e) => setRemark(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" loading={create.isPending} disabled={!valid}>
        <Send className="size-4" /> Settlement request bhejo
      </Button>
    </form>
  );
}

export default function SettlementPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const banksQuery = useSettlementBanks();
  const banks = useMemo(() => banksQuery.data ?? [], [banksQuery.data]);
  const { data, isLoading, isError, isFetching, refetch } = useSettlements({ page, limit, status });
  const rows = useMemo(() => data?.data ?? [], [data]);
  const cancel = useCancelSettlement();

  const columns = useMemo(
    () => [
      helper.accessor("createdAt", {
        header: "Requested",
        cell: (i) => <span className="whitespace-nowrap">{formatDateTime(i.getValue())}</span>,
      }),
      helper.accessor("amount", {
        header: "Amount",
        cell: (i) => <span className="font-semibold">{inr(i.getValue())}</span>,
      }),
      helper.display({
        id: "bank",
        header: "Bank",
        cell: (i) => {
          const r = i.row.original;
          return (
            <div>
              <p className="font-semibold">{r.bank_name}</p>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {r.account_number} · {r.ifsc_code}
              </p>
            </div>
          );
        },
      }),
      helper.accessor("status", {
        header: "Status",
        cell: (i) => <StatusBadge status={i.getValue()} />,
      }),
      helper.display({
        id: "processed",
        header: "Processed / UTR",
        cell: (i) => {
          const r = i.row.original;
          return (
            <div className="text-xs">
              <p className="whitespace-nowrap">{r.processed_at ? formatDateTime(r.processed_at) : "—"}</p>
              {r.utr && <p className="font-mono text-slate-500 dark:text-slate-400">{r.utr}</p>}
            </div>
          );
        },
      }),
      helper.display({
        id: "remark",
        header: "Remark",
        cell: (i) => {
          const r = i.row.original;
          return (
            <div className="max-w-[200px] text-xs">
              <p className="truncate" title={r.remark ?? ""}>{r.remark || "—"}</p>
              {r.admin_remark && (
                <p className="truncate text-slate-500 dark:text-slate-400" title={r.admin_remark}>
                  Admin: {r.admin_remark}
                </p>
              )}
            </div>
          );
        },
      }),
      // Sirf pending request cancel ho sakti hai
      helper.display({
        id: "actions",
        header: "Action",
        cell: (i) => {
          const r = i.row.original;
          if (!isPending(r.status)) return <span className="text-xs text-slate-400">—</span>;
          return (
            <button
              type="button"
              disabled={cancel.isPending && cancel.variables === r.id}
              onClick={() => {
                if (window.confirm(`${inr(r.amount)} ki settlement request cancel karni hai?`)) cancel.mutate(r.id);
              }}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/15"
            >
              <Ban className="size-3.5" /> Cancel
            </button>
          );
        },
      }),
    ],
    [cancel.mutate, cancel.isPending, cancel.variables] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-6">
      <PageHeader icon={<Banknote className="size-5" />} title="Settlement" subtitle="Apne bank add karo aur wallet se paisa mangwao" />

      <SettlementBanksSection
        data={banks}
        isLoading={banksQuery.isLoading}
        isError={banksQuery.isError}
        refetch={() => banksQuery.refetch()}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">
            <Send className="size-4" />
          </span>
          <div>
            <h2 className="font-bold">Nayi Settlement Request</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bank chuno, amount daalo aur request bhejo</p>
          </div>
        </div>
        <SettlementForm banks={banks} banksLoading={banksQuery.isLoading} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-bold">Meri Requests</h2>
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
        </div>

        <div className={cn("p-1 transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <SkeletonRows rows={5} />
          ) : isError && !data ? (
            <ErrorBox what="Settlement requests" onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(r) => r.id} emptyText="Abhi tak koi settlement request nahi" />
          )}
        </div>

        <Pagination
          page={page}
          limit={limit}
          total={data?.total ?? 0}
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
