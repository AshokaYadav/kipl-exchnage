"use client";

import { useState } from "react";
import { Building2, Check, Copy, Landmark, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBox } from "@/components/reports/report-parts";
import { cn } from "@/lib/utils";
import {
  useDeleteSettlementBank,
  useMakeDefaultBank,
  useSaveSettlementBank,
} from "@/hooks/useSettlementBanks";
import type { SettlementBank } from "@/services/settlement.service";

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const actionBtn =
  "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition disabled:opacity-50";

// Sirf aakhri 4 digit dikhao — poora number copy row mein hai
const mask = (n: string) => (n.length > 4 ? `•••• ${n.slice(-4)}` : n);

function CopyRow({ label, value, light }: { label: string; value: string | null; light?: boolean }) {
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
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className={light ? "text-white/70" : "text-slate-500 dark:text-slate-400"}>{label}</span>
      <button
        type="button"
        onClick={copy}
        className={cn("inline-flex min-w-0 items-center gap-1.5 font-semibold", light ? "hover:text-accent-300" : "hover:text-brand-700 dark:hover:text-brand-200")}
        title="Copy"
      >
        <span className="truncate">{value}</span>
        {copied ? (
          <Check className={cn("size-3.5 shrink-0", light ? "text-accent-300" : "text-emerald-600")} />
        ) : (
          <Copy className={cn("size-3.5 shrink-0", light ? "text-white/60" : "text-slate-400")} />
        )}
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
  // Default bank card jaisa gradient, baaki saade
  const light = isDefault;
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl p-4 transition",
        light
          ? "bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-600/25"
          : "border border-slate-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-slate-900 dark:hover:border-brand-500/40",
        editing && "ring-4 ring-accent-400/60"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            light ? "bg-white/15" : "bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200"
          )}
        >
          <Landmark className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{bank.bank_name}</p>
          <p className={cn("font-mono text-sm tracking-wider", light ? "text-white/80" : "text-slate-500 dark:text-slate-400")}>
            {mask(bank.account_number)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isDefault && (
            <span className="inline-flex items-center gap-1 rounded-md bg-accent-400 px-2 py-0.5 text-xs font-bold text-brand-950">
              <Star className="size-3" /> Default
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
              light
                ? "bg-white/15 text-white"
                : active
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
            )}
          >
            <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-400" : "bg-slate-400")} />
            {bank.status || "—"}
          </span>
        </div>
      </div>

      <div className={cn("mt-3 flex-1 border-t pt-2", light ? "border-white/15" : "border-slate-100 dark:border-white/5")}>
        <CopyRow light={light} label="Holder" value={bank.account_holder_name} />
        <CopyRow light={light} label="A/c No." value={bank.account_number} />
        <CopyRow light={light} label="IFSC" value={bank.ifsc_code} />
        <CopyRow light={light} label="Branch" value={bank.branch} />
        <CopyRow light={light} label="UPI" value={bank.upi_id} />
      </div>

      <div className={cn("mt-3 flex flex-wrap gap-1 border-t pt-3", light ? "border-white/15" : "border-slate-100 dark:border-white/5")}>
        <button
          type="button"
          onClick={onEdit}
          className={cn(actionBtn, light ? "hover:bg-white/15" : "text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20")}
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
          className={cn(
            actionBtn,
            "ml-auto",
            light ? "text-red-100 hover:bg-red-500/30" : "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/15"
          )}
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
function BankForm({
  bank,
  firstBank,
  onDone,
  onCancel,
}: {
  bank: SettlementBank | null;
  firstBank: boolean;
  onDone: () => void;
  onCancel?: () => void;
}) {
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <Input label="Branch (optional)" name="branch" value={form.branch} onChange={(e) => set("branch", e.target.value)} />
        <Input label="UPI ID (optional)" name="upi_id" placeholder="name@upi" value={form.upi_id} onChange={(e) => set("upi_id", e.target.value.trim())} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="mr-auto flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-brand-600"
            checked={forceDefault || form.is_default}
            disabled={forceDefault}
            onChange={(e) => set("is_default", e.target.checked)}
          />
          Default bank banao {forceDefault && <span className="text-slate-500 dark:text-slate-400">(pehla bank apne aap default hai)</span>}
        </label>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="size-4" /> Cancel
          </Button>
        )}
        <Button type="submit" loading={save.isPending} disabled={!valid}>
          {bank ? <Save className="size-4" /> : <Plus className="size-4" />}
          {bank ? "Changes save karo" : "Bank add karo"}
        </Button>
      </div>
    </form>
  );
}

// 🏦 Settlement page ke top par — bank list + add / edit form
export function SettlementBanksSection({
  data,
  isLoading,
  isError,
  refetch,
}: {
  data: SettlementBank[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}) {
  // null = form band, "new" = naya bank, warna jis bank ko edit kar rahe
  const [formFor, setFormFor] = useState<SettlementBank | "new" | null>(null);
  const makeDefault = useMakeDefaultBank();
  const remove = useDeleteSettlementBank();

  const editing = formFor && formFor !== "new" ? formFor : null;
  const empty = !isLoading && !isError && data.length === 0;
  // Koi bank hi nahi toh form seedha khula rakho
  const showForm = formFor !== null || empty;

  // Default bank sabse pehle
  const banks = [...data].sort((a, b) => Number(Boolean(b.is_default)) - Number(Boolean(a.is_default)));

  const confirmDelete = (b: SettlementBank) => {
    if (!window.confirm(`${b.bank_name} (${b.account_number}) delete karna hai?`)) return;
    remove.mutate(b.id, {
      onSuccess: () => {
        if (editing?.id === b.id) setFormFor(null);
      },
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">
            <Building2 className="size-4" />
          </span>
          <div>
            <h2 className="font-bold">
              Mere Banks {!isLoading && data.length > 0 && <span className="text-slate-400">({data.length})</span>}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Payout / settlement inhi mein aayega</p>
          </div>
        </div>
        {!showForm && (
          <Button type="button" variant="outline" className="h-9 px-4" onClick={() => setFormFor("new")}>
            <Plus className="size-4" /> Naya bank
          </Button>
        )}
      </div>

      {showForm && (
        <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-5 dark:border-white/10 dark:bg-white/[0.02]">
          <h3 className="mb-4 text-sm font-bold">{editing ? `Edit — ${editing.bank_name}` : "Naya Bank add karo"}</h3>
          {/* key se edit badalte hi form naye data se bhar jata hai */}
          <BankForm
            key={editing?.id ?? "new"}
            bank={editing}
            firstBank={empty}
            onDone={() => setFormFor(null)}
            onCancel={empty ? undefined : () => setFormFor(null)}
          />
        </div>
      )}

      <div className="p-5">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : isError ? (
          <ErrorBox what="Bank list" onRetry={refetch} />
        ) : banks.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {banks.map((b) => (
              <BankCard
                key={b.id}
                bank={b}
                editing={editing?.id === b.id}
                onEdit={() => setFormFor(b)}
                onMakeDefault={() => makeDefault.mutate(b.id)}
                onDelete={() => confirmDelete(b)}
                defaultBusy={makeDefault.isPending && makeDefault.variables === b.id}
                deleteBusy={remove.isPending && remove.variables === b.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">Abhi koi bank add nahi kiya — upar form bharo</p>
        )}
      </div>
    </section>
  );
}
