"use client";

import { useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Boxes, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useApis, useCategories, useOperatorMappings } from "@/hooks/useApis";
import { useCreateStock, useDeleteStock, useStock, useUpdateStock } from "@/hooks/useStock";
import { DEMO_CATEGORY, type Category } from "@/services/apis.service";
import type { Named, Stock, StockInput } from "@/services/stock.service";

const stockHelper = createColumnHelper<Stock>();

const badge = "rounded-md px-2 py-0.5 text-xs font-semibold";

export default function StockPage() {
  const { data = [], isLoading, isError, refetch } = useStock();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Stock | null>(null);
  const remove = useDeleteStock();

  // Circle ki alag API nahi hai — jo circles stock list mein aaye, wahi form mein dikhate hain
  const knownCircles = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of data) for (const c of s.circles ?? []) map.set(c.id, c.name);
    return [...map].map(([id, name]) => ({ id, name }));
  }, [data]);






  const columns = useMemo(
    () => [
      stockHelper.accessor((s) => s.operator?.name ?? "N/A", {
        id: "operator",
        header: "Operator",
        cell: (i) => (
          <div>
            <p className="font-semibold">{i.getValue()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{i.row.original.category?.name}</p>
          </div>
        ),
      }),
      stockHelper.accessor((s) => s.api?.name ?? "", { id: "api", header: "API" }),
      stockHelper.accessor("amount", {
        header: "Amount",
        cell: (i) => (
          <span>
            ₹{i.getValue()}{" "}
            <span className="text-xs text-slate-400">({i.row.original.amount_type})</span>
          </span>
        ),
      }),
      stockHelper.display({
        id: "circles",
        header: "Circles",
        cell: (i) => {
          const s = i.row.original;
          if (s.circle_type !== "MULTIPLE") return <span className="text-xs text-slate-500">{s.circle_type}</span>;
          return (
            <div className="flex max-w-[240px] flex-wrap gap-1">
              {(s.circles ?? []).map((c) => (
                <span key={c.id} className={cn(badge, "bg-slate-100 font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300")}>
                  {c.name}
                </span>
              ))}
            </div>
          );
        },
      }),
      stockHelper.accessor((s) => Number(s.total_margin ?? s.margin), {
        id: "margin",
        header: "Margin",
        cell: (i) => {
          const s = i.row.original;
          return (
            <div>
              <p className="font-semibold">{i.getValue()}%</p>
              <p className="text-xs text-slate-400">
                Mine {s.margin} + Admin {s.admin_margin ?? 0}
              </p>
            </div>
          );
        },
      }),
      stockHelper.accessor("limit_amount", {
        header: "Limit",
        cell: (i) => {
          const s = i.row.original;
          return (
            <div>
              <p className="font-semibold">
                ₹{i.getValue()} <span className="text-xs font-normal text-slate-400">/ {s.limit_type}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Used ₹{s.used_amount ?? 0} · Bacha ₹{s.remaining_amount ?? i.getValue()}
              </p>
            </div>
          );
        },
      }),
      stockHelper.accessor("status", {
        header: "Status",
        cell: (i) =>
          i.getValue() === "ACTIVE" ? (
            <span className={cn(badge, "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300")}>Active</span>
          ) : (
            <span className={cn(badge, "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300")}>{i.getValue()}</span>
          ),
      }),
      stockHelper.display({
        id: "actions",
        header: "Actions",
        cell: (i) => {
          const s = i.row.original;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(s)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20"
              >
                <Pencil className="size-3.5" /> Edit
              </button>
              <button
                disabled={remove.isPending && remove.variables === s.id}
                onClick={() => {
                  if (window.confirm(`${s.operator?.name ?? "Ye"} stock delete karna hai?`)) remove.mutate(s.id);
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                <Trash2 className="size-3.5" /> Delete
              </button>
            </div>
          );
        },
      }),
    ],
    [remove]
  );






  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
            <Boxes className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Available Stock</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Operator-wise stock, margin aur limit</p>
          </div>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add Stock
        </Button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-bold">Stock List</h2>
        </div>
        <div className="p-1">
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ) : isError ? (
            <div className="p-5 text-sm text-red-600 dark:text-red-300">
              Stock load nahi hua.{" "}
              <button onClick={() => refetch()} className="font-semibold underline">Retry</button>
            </div>
          ) : (
            <DataTable columns={columns} data={data} emptyText="Abhi koi stock nahi hai — Add Stock dabao" />
          )}
        </div>
      </section>

      {adding && <StockFormModal circles={knownCircles} onClose={() => setAdding(false)} />}
      {editing && <StockEditModal stock={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}









// ───────────── Stock edit (margin + limit) ─────────────

function StockEditModal({ stock, onClose }: { stock: Stock; onClose: () => void }) {
  const [margin, setMargin] = useState(String(stock.margin ?? ""));
  const [limitAmount, setLimitAmount] = useState(String(stock.limit_amount ?? ""));
  const [limitType, setLimitType] = useState(stock.limit_type || "DAILY");
  const save = useUpdateStock(onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(margin);
    if (margin.trim() === "" || Number.isNaN(m)) return toast.error("Sahi margin daalo");
    const limit = Number(limitAmount);
    if (!limit || limit < 0) return toast.error("Sahi limit amount daalo");
    save.mutate({ id: stock.id, input: { margin: m, limit_amount: limit, limit_type: limitType } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold">Edit Stock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stock.operator?.name ?? "Operator"} · {stock.api?.name}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6">
          <Input
            label="Margin (%)"
            name="margin"
            inputMode="decimal"
            value={margin}
            placeholder="e.g. 3"
            onChange={(e) => setMargin(e.target.value)}
          />
          <Input
            label="Limit Amount"
            name="limit_amount"
            type="number"
            value={limitAmount}
            placeholder="e.g. 3000"
            onChange={(e) => setLimitAmount(e.target.value)}
          />
          <Select label="Limit Type" value={limitType} onChange={setLimitType}>
            <option value="DAILY">DAILY</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="MONTHLY">MONTHLY</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/10">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>Update Stock</Button>
        </div>
      </form>
    </div>
  );
}






// ───────────── Naya stock form ─────────────

const selectCls =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:opacity-60 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-500/20";

function Select({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <select className={selectCls} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  );
}

type FormState = {
  api_id: string;
  category_id: string;
  operator_id: string;
  amount_type: string;
  amount: string;
  circle_type: string;
  circle: string[];
  extraCircles: string;
  margin: string;
  limit_amount: string;
  limit_type: string;
};

const EMPTY: FormState = {
  api_id: "",
  category_id: "",
  operator_id: "",
  amount_type: "MULTIPLE",
  amount: "",
  circle_type: "MULTIPLE",
  circle: [],
  extraCircles: "",
  margin: "",
  limit_amount: "",
  limit_type: "DAILY",
};

function toPayload(f: FormState): StockInput {
  if (!f.api_id) throw new Error("API chuno");
  if (!f.category_id) throw new Error("Category chuno");
  if (!f.operator_id) throw new Error("Operator chuno");
  if (f.amount_type === "MULTIPLE" && !f.amount.trim()) throw new Error("Amount daalo");

  const circle = [
    ...new Set([
      ...f.circle,
      ...f.extraCircles.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean),
    ]),
  ];
  if (f.circle_type === "MULTIPLE" && circle.length === 0) throw new Error("Kam se kam ek circle chuno");

  const margin = Number(f.margin);
  if (f.margin.trim() === "" || Number.isNaN(margin)) throw new Error("Sahi margin daalo");
  const limit = Number(f.limit_amount);
  if (!limit || limit < 0) throw new Error("Sahi limit amount daalo");

  return {
    api_id: f.api_id,
    operator_id: f.operator_id,
    category_id: f.category_id,
    amount_type: f.amount_type,
    amount: f.amount.trim(),
    circle_type: f.circle_type,
    circle: f.circle_type === "MULTIPLE" ? circle : [],
    margin,
    limit_amount: limit,
    limit_type: f.limit_type,
  };
}

function StockFormModal({ circles, onClose }: { circles: Named[]; onClose: () => void }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const apisQuery = useApis();
  const categoriesQuery = useCategories();
  // Categories API fail ho toh DEMO category se kaam chalate hain
  const categories = useMemo<Category[]>(
    () => (categoriesQuery.isError ? [DEMO_CATEGORY] : categoriesQuery.data ?? []),
    [categoriesQuery.isError, categoriesQuery.data]
  );
  // API + category ke operators mapping list se milte hain
  const operatorsQuery = useOperatorMappings(form.api_id, form.category_id);
  const operators = operatorsQuery.data ?? [];

  const save = useCreateStock(onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleCircle = (id: string) =>
    set("circle", form.circle.includes(id) ? form.circle.filter((c) => c !== id) : [...form.circle, id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      save.mutate(toPayload(form));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold">Add Stock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Naya available stock operator banao</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
          <Select
            label="API"
            value={form.api_id}
            disabled={apisQuery.isLoading}
            onChange={(v) => setForm((p) => ({ ...p, api_id: v, operator_id: "" }))}
          >
            <option value="">{apisQuery.isLoading ? "Loading..." : "Select API"}</option>
            {(apisQuery.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>

          <Select
            label="Category"
            value={form.category_id}
            disabled={categoriesQuery.isLoading}
            onChange={(v) => setForm((p) => ({ ...p, category_id: v, operator_id: "" }))}
          >
            <option value="">{categoriesQuery.isLoading ? "Loading..." : "Select Category"}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <div className="sm:col-span-2">
            <Select
              label="Operator"
              value={form.operator_id}
              disabled={!form.api_id || !form.category_id || operatorsQuery.isFetching}
              onChange={(v) => set("operator_id", v)}
            >
              <option value="">
                {!form.api_id || !form.category_id
                  ? "Pehle API aur Category chuno"
                  : operatorsQuery.isFetching
                    ? "Loading..."
                    : operators.length
                      ? "Select Operator"
                      : "Koi operator nahi mila"}
              </option>
              {operators.map((o) => (
                <option key={o.operator_id} value={o.operator_id}>{o.operator?.name ?? o.operator_id}</option>
              ))}
            </Select>
          </div>

          <Select label="Amount Type" value={form.amount_type} onChange={(v) => set("amount_type", v)}>
            <option value="MULTIPLE">MULTIPLE</option>
            <option value="ALL">ALL</option>
            <option value="MULTIPLE">RANGE</option>
          </Select>


          <Input
            label="Amount"
            name="amount"
            value={form.amount}
            disabled={form.amount_type === "ALL"}
            placeholder={form.amount_type === "ALL" ? "e.g. 500-1000" : "e.g. 500,1000,1500"}
            onChange={(e) => set("amount", e.target.value)}
          />

          <Input
            label="Margin (%)"
            name="margin"
            inputMode="decimal"
            value={form.margin}
            placeholder="e.g. 2"
            onChange={(e) => set("margin", e.target.value)}
          />
          <Select label="Circle Type" value={form.circle_type} onChange={(v) => set("circle_type", v)}>
            <option value="MULTIPLE">MULTIPLE</option>
            <option value="ALL">ALL</option>
          </Select>

          {form.circle_type === "MULTIPLE" && (
            <div className="space-y-3 sm:col-span-2">
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Circles</span>
              {circles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {circles.map((c) => {
                    const on = form.circle.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCircle(c.id)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                          on
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/5"
                        )}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <Input
                label="Aur circle IDs (comma se alag)"
                name="extraCircles"
                value={form.extraCircles}
                placeholder="circle-id-1, circle-id-2"
                onChange={(e) => set("extraCircles", e.target.value)}
              />
            </div>
          )}

          <Input
            label="Limit Amount"
            name="limit_amount"
            type="number"
            value={form.limit_amount}
            placeholder="e.g. 5000"
            onChange={(e) => set("limit_amount", e.target.value)}
          />
          <Select label="Limit Type" value={form.limit_type} onChange={(v) => set("limit_type", v)}>
            <option value="DAILY">DAILY</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="MONTHLY">MONTHLY</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/10">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>Save Stock</Button>
        </div>
      </form>
    </div>
  );
}
