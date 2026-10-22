"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Check, Copy, Landmark, Send, WalletCards } from "lucide-react";
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
  formatDate,
  formatDateTime,
  inr,
  today,
} from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import { useCreateTopup, useTopupBanks, useTopups } from "@/hooks/useTopup";
import type { TopupBank, TopupRequest } from "@/services/topup.service";

const helper = createColumnHelper<TopupRequest>();

const METHODS = ["IMPS", "NEFT", "RTGS", "UPI", "CASH", "CHEQUE"];

const columns = [
  helper.accessor("createdAt", {
    header: "Requested",
    cell: (i) => <span className="whitespace-nowrap">{formatDateTime(i.getValue())}</span>,
  }),
  helper.accessor((r) => Number(r.deposite_amount), {
    id: "amount",
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
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{r.account_number}</p>
        </div>
      );
    },
  }),
  helper.display({
    id: "payment",
    header: "Payment",
    cell: (i) => {
      const r = i.row.original;
      return (
        <div className="text-xs">
          <p className="font-semibold">{r.payment_method}</p>
          <p className="font-mono text-slate-500 dark:text-slate-400">{r.bank_utr}</p>
        </div>
      );
    },
  }),
  helper.accessor("date", {
    header: "Deposit Date",
    cell: (i) => <span className="whitespace-nowrap">{formatDate(i.getValue())}</span>,
  }),
  helper.accessor("status", {
    header: "Status",
    cell: (i) => <StatusBadge status={i.getValue()} />,
  }),
  helper.accessor("remark", {
    header: "Remark",
    cell: (i) => (
      <span className="block max-w-[200px] truncate text-xs text-slate-500 dark:text-slate-400" title={i.getValue() ?? ""}>
        {i.getValue() || "—"}
      </span>
    ),
  }),
];

function CopyRow({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard block ho toh chup-chaap chhod do
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <button type="button" onClick={copy} className="inline-flex min-w-0 items-center gap-1.5 font-semibold hover:text-brand-700 dark:hover:text-brand-200" title="Copy">
        <span className="truncate">{value}</span>
        {copied ? <Check className="size-3.5 shrink-0 text-emerald-600" /> : <Copy className="size-3.5 shrink-0 text-slate-400" />}
      </button>
    </div>
  );
}

function BankCard({ bank }: { bank: TopupBank }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      <div className="mb-2 flex items-center gap-2">
        <Landmark className="size-4 text-brand-600 dark:text-brand-300" />
        <p className="font-bold">{bank.bank_name}</p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        <CopyRow label="Holder" value={bank.account_holder_name} />
        <CopyRow label="A/c No." value={bank.account_number} />
        <CopyRow label="IFSC" value={bank.ifsc_code} />
        <CopyRow label="Branch" value={bank.branch} />
        <CopyRow label="UPI" value={bank.upi_id} />
      </div>
    </div>
  );
}

const emptyForm = () => ({ bank_id: "", amount: "", payment_method: "IMPS", bank_utr: "", date: today(), remark: "" });

function TopupForm({ banks, banksLoading }: { banks: TopupBank[]; banksLoading: boolean }) {
  const [form, setForm] = useState(emptyForm);
  const create = useCreateTopup(() => setForm(emptyForm()));

  // Ek hi bank ho toh wahi select rahe
  const bankId = form.bank_id || (banks.length === 1 ? banks[0].id : "");
  const set = (k: keyof ReturnType<typeof emptyForm>) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const amount = Number(form.amount);
  const valid = bankId && amount > 0 && form.bank_utr.trim() && form.date;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        create.mutate({
          bank_id: bankId,
          amount,
          payment_method: form.payment_method,
          bank_utr: form.bank_utr.trim(),
          date: form.date,
          remark: form.remark.trim() || undefined,
        });
      }}
    >
      <Field label="Bank" className="sm:w-full">
        <select className={fieldCls} value={bankId} disabled={banksLoading} onChange={(e) => set("bank_id")(e.target.value)} required>
          <option value="">{banksLoading ? "Loading..." : "Bank chuno"}</option>
          {banks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.bank_name} — {b.account_number}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Amount (₹)"
          name="amount"
          inputMode="decimal"
          placeholder="500"
          value={form.amount}
          onChange={(e) => set("amount")(e.target.value.replace(/[^\d.]/g, ""))}
          required
        />
        <Field label="Payment Method" className="sm:w-full">
          <select className={fieldCls} value={form.payment_method} onChange={(e) => set("payment_method")(e.target.value)}>
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Input label="UTR / Ref No." name="bank_utr" placeholder="UTR123456" value={form.bank_utr} onChange={(e) => set("bank_utr")(e.target.value)} required />
        <Input label="Deposit Date" name="date" type="date" max={today()} value={form.date} onChange={(e) => set("date")(e.target.value)} required />
      </div>
      <Input label="Remark (optional)" name="remark" value={form.remark} onChange={(e) => set("remark")(e.target.value)} />
      <Button type="submit" className="w-full" loading={create.isPending} disabled={!valid}>
        <Send className="size-4" /> Request bhejo
      </Button>
    </form>
  );
}

export default function FundRequestPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const banksQuery = useTopupBanks();
  const banks = useMemo(() => banksQuery.data ?? [], [banksQuery.data]);
  const { data, isLoading, isError, isFetching, refetch } = useTopups({ page, limit });
  const rows = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className="space-y-6">
      <PageHeader icon={<WalletCards className="size-5" />} title="Fund Request" subtitle="Bank mein paisa daalo aur wallet top-up ki request bhejo" />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 lg:col-span-3">
          <h2 className="mb-4 font-bold">Nayi Request</h2>
          <TopupForm banks={banks} banksLoading={banksQuery.isLoading} />
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 lg:col-span-2">
          <h2 className="font-bold">Is bank mein paisa daalo</h2>
          {banksQuery.isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ) : banksQuery.isError ? (
            <ErrorBox what="Bank list" onRetry={() => banksQuery.refetch()} />
          ) : banks.length ? (
            banks.map((b) => <BankCard key={b.id} bank={b} />)
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Abhi koi bank add nahi hai</p>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <h2 className="border-b border-slate-100 px-5 py-4 font-bold dark:border-white/10">Meri Requests</h2>
        <div className={cn("p-1 transition-opacity", isFetching && !isLoading && "opacity-60")}>
          {isLoading ? (
            <SkeletonRows rows={5} />
          ) : isError && !data ? (
            <ErrorBox what="Fund requests" onRetry={() => refetch()} />
          ) : (
            <DataTable columns={columns} data={rows} getRowId={(r) => r.id} emptyText="Abhi tak koi request nahi bheji" />
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
