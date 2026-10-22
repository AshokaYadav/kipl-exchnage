"use client";

import { useState } from "react";
import { Building2, Check, Copy, Landmark, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBox, PageHeader } from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import {
  useDeleteSettlementBank,
  useMakeDefaultBank,
  useSaveSettlementBank,
  useSettlementBanks,
} from "@/hooks/useSettlementBanks";
import type { SettlementBank } from "@/services/settlement.service";

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const badge = "rounded-md px-2 py-0.5 text-xs font-semibold";

const actionBtn =
  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition disabled:opacity-50";

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

function BankCard({
  bank,
  editing,
  onEdit,
  onMakeDefault,
  onDelete,
  defaultBusy,
  deleteBusy,
}: {
  bank: SettlementBank;
  editing: boolean;
  onEdit: () => void;
  onMakeDefault: () => void;
  onDelete: () => void;
  defaultBusy: boolean;
  deleteBusy: boolean;
}) {
  const isDefault = Boolean(bank.is_default);
  const active = bank.status?.toUpperCase() === "ACTIVE";
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        editing
          ? "border-brand-500 ring-4 ring-brand-100 dark:ring-brand-500/20"
          : isDefault
            ? "border-brand-300 dark:border-brand-500/40"
            : "border-slate-200 dark:border-white/10"
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Landmark className="size-4 text-brand-600 dark:text-brand-300" />
        <p className="font-bold">{bank.bank_name}</p>
        <div className="ml-auto flex gap-1.5">
          {isDefault && (
            <span className={cn(badge, "inline-flex items-center gap-1 bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200")}>
              <Star className="size-3" /> Default
            </span>
          )}
          <span
            className={cn(
              badge,
              active
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
            )}
          >
            {bank.status || "—"}
          </span>
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        <CopyRow label="Holder" value={bank.account_holder_name} />
        <CopyRow label="A/c No." value={bank.account_number} />
        <CopyRow label="IFSC" value={bank.ifsc_code} />
        <CopyRow label="Branch" value={bank.branch} />
        <CopyRow label="UPI" value={bank.upi_id} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
        <button
          type="button"
          onClick={onEdit}
          className={cn(actionBtn, "text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20")}
        >
          <Pencil className="size-3.5" /> Edit
        </button>
        {!isDefault && (
          <button
            type="button"
            onClick={onMakeDefault}
            disabled={defaultBusy}
            className={cn(actionBtn, "text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20")}
          >
            <Star className="size-3.5" /> Default banao
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={deleteBusy}
          className={cn(actionBtn, "ml-auto text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/15")}
        >
          <Trash2 className="size-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

const toForm = (b?: SettlementBank | null) => ({
  account_holder_name: b?.account_holder_name ?? "",
  bank_name: b?.bank_name ?? "",
  account_number: b?.account_number ?? "",
  confirm_account: b?.account_number ?? "",
  ifsc_code: b?.ifsc_code ?? "",
  branch: b?.branch ?? "",
  upi_id: b?.upi_id ?? "",
  is_default: Boolean(b?.is_default),
});

type FormState = ReturnType<typeof toForm>;

// bank diya ho toh edit, warna naya add
function BankForm({ bank, firstBank, onDone }: { bank: SettlementBank | null; firstBank: boolean; onDone: () => void }) {
  const [form, setForm] = useState(() => toForm(bank));
  const save = useSaveSettlementBank(() => {
    setForm(toForm());
    onDone();
  });
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Pehla bank hamesha default
  const forceDefault = !bank && firstBank;
  const ifscBad = form.ifsc_code.length > 0 && !IFSC_RE.test(form.ifsc_code);
  const mismatch = form.confirm_account.length > 0 && form.confirm_account !== form.account_number;
  const valid =
    form.account_holder_name.trim() &&
    form.bank_name.trim() &&
    form.account_number.length >= 6 &&
    form.confirm_account === form.account_number &&
    IFSC_RE.test(form.ifsc_code);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        save.mutate({
          id: bank?.id,
          input: {
            account_holder_name: form.account_holder_name.trim(),
            bank_name: form.bank_name.trim(),
            account_number: form.account_number,
            ifsc_code: form.ifsc_code,
            branch: form.branch.trim() || undefined,
            upi_id: form.upi_id.trim() || undefined,
            is_default: forceDefault || form.is_default,
          },
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Account Holder Name"
          name="account_holder_name"
          placeholder="Bank ke hisaab se naam"
          value={form.account_holder_name}
          onChange={(e) => set("account_holder_name", e.target.value)}
          required
        />
        <Input label="Bank Name" name="bank_name" placeholder="SBI" value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} required />
        <Input
          label="Account Number"
          name="account_number"
          inputMode="numeric"
          autoComplete="off"
          value={form.account_number}
          onChange={(e) => set("account_number", e.target.value.replace(/\D/g, ""))}
          required
        />
        <Input
          label="Confirm Account Number"
          name="confirm_account"
          inputMode="numeric"
          autoComplete="off"
          value={form.confirm_account}
          onChange={(e) => set("confirm_account", e.target.value.replace(/\D/g, ""))}
          hint={mismatch ? "Account number match nahi ho raha" : undefined}
          className={cn(mismatch && "border-red-400 focus:border-red-500")}
          required
        />
        <Input
          label="IFSC Code"
          name="ifsc_code"
          placeholder="SBIN0001234"
          maxLength={11}
          value={form.ifsc_code}
          onChange={(e) => set("ifsc_code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          hint={ifscBad ? "IFSC galat lag raha hai (jaise SBIN0001234)" : undefined}
          className={cn(ifscBad && "border-red-400 focus:border-red-500")}
          required
        />
        <Input label="Branch (optional)" name="branch" value={form.branch} onChange={(e) => set("branch", e.target.value)} />
        <Input label="UPI ID (optional)" name="upi_id" placeholder="name@upi" value={form.upi_id} onChange={(e) => set("upi_id", e.target.value.trim())} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-brand-600"
          checked={forceDefault || form.is_default}
          disabled={forceDefault}
          onChange={(e) => set("is_default", e.target.checked)}
        />
        Default bank banao {forceDefault && <span className="text-slate-500 dark:text-slate-400">(pehla bank apne aap default hai)</span>}
      </label>

      <div className="flex gap-3">
        {bank && (
          <Button type="button" variant="outline" onClick={onDone}>
            <X className="size-4" /> Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" loading={save.isPending} disabled={!valid}>
          {bank ? <Save className="size-4" /> : <Plus className="size-4" />}
          {bank ? "Changes save karo" : "Bank add karo"}
        </Button>
      </div>
    </form>
  );
}

export default function SettlementBanksPage() {
  const { data = [], isLoading, isError, refetch } = useSettlementBanks();
  const [editing, setEditing] = useState<SettlementBank | null>(null);
  const makeDefault = useMakeDefaultBank();
  const remove = useDeleteSettlementBank();

  // Default bank sabse upar
  const banks = [...data].sort((a, b) => Number(Boolean(b.is_default)) - Number(Boolean(a.is_default)));

  const confirmDelete = (b: SettlementBank) => {
    if (!window.confirm(`${b.bank_name} (${b.account_number}) delete karna hai?`)) return;
    remove.mutate(b.id, {
      onSuccess: () => {
        if (editing?.id === b.id) setEditing(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<Building2 className="size-5" />} title="Settlement Banks" subtitle="Apne bank add karo — payout / settlement yahin aayega" />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 lg:col-span-3">
          <h2 className="mb-4 font-bold">{editing ? `Edit — ${editing.bank_name}` : "Naya Bank"}</h2>
          {/* key se edit badalte hi form naye data se bhar jata hai */}
          <BankForm
            key={editing?.id ?? "new"}
            bank={editing}
            firstBank={!isLoading && !isError && data.length === 0}
            onDone={() => setEditing(null)}
          />
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 lg:col-span-2">
          <h2 className="font-bold">Mere Banks {!isLoading && data.length > 0 && <span className="text-slate-400">({data.length})</span>}</h2>
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ) : isError ? (
            <ErrorBox what="Bank list" onRetry={() => refetch()} />
          ) : banks.length ? (
            banks.map((b) => (
              <BankCard
                key={b.id}
                bank={b}
                editing={editing?.id === b.id}
                onEdit={() => {
                  setEditing(b);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onMakeDefault={() => makeDefault.mutate(b.id)}
                onDelete={() => confirmDelete(b)}
                defaultBusy={makeDefault.isPending && makeDefault.variables === b.id}
                deleteBusy={remove.isPending && remove.variables === b.id}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Abhi koi bank add nahi kiya</p>
          )}
        </section>
      </div>
    </div>
  );
}
