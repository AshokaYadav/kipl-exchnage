"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Percent, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { axiosInstance, getErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useApis, useCategories, useOperatorMappings } from "@/hooks/useApis";
import { DEMO_CATEGORY, type Category } from "@/services/apis.service";

// Backend ka common response: { err, message, data }
type ApiResponse<T> = { err: unknown; message?: string; data: T };

type Named = { id: string; name: string };

type AvailableStock = {
  available_amount: number;
  unlimited: boolean;
  stock_count: number;
};

type RequiredMargin = {
  id: string;
  user_id: string;
  operator_id: string;
  category_id: string;
  margin: number;
  status: boolean;
  admin_status: string;
  fix_margin: boolean;
  createdAt: string;
  updatedAt: string;
  operator?: Named & { image_url?: string };
  category?: Named;
  available_stock?: AvailableStock;
  available_stock_at_margin?: AvailableStock;
};

type RequiredMarginInput = { operator_id: string; margin: number; status: boolean };
type RequiredMarginUpdateInput = { margin: number; status: boolean; fix_margin: boolean };

// err aaye toh throw karo, taaki react-query ka onError toast dikha de
function unwrap<T>(body: ApiResponse<T>): T {
  if (body?.err) throw new Error(body.message ?? "Request fail ho gayi");
  return body.data;
}

// 📊 Required margin setting list
const getRequiredMargin = async (): Promise<RequiredMargin[]> => {
  const res = await axiosInstance.get<ApiResponse<RequiredMargin[]>>("/apis/exchange/required-margin");
  return unwrap(res.data) ?? [];
};

// ➕ Naya required margin
const createRequiredMargin = async (input: RequiredMarginInput) => {
  const res = await axiosInstance.post<ApiResponse<RequiredMargin>>("/apis/exchange/required-margin", input);
  return unwrap(res.data);
};

// ✏️ Required margin update
const updateRequiredMargin = async (id: string, input: RequiredMarginUpdateInput) => {
  const res = await axiosInstance.put<ApiResponse<RequiredMargin>>(`/apis/exchange/required-margin/${id}`, input);
  return unwrap(res.data);
};

// 🗑️ Required margin delete
const deleteRequiredMargin = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<{ id: string; deleted: boolean }>>(
    `/apis/exchange/required-margin/${id}`
  );
  return unwrap(res.data);
};

const helper = createColumnHelper<RequiredMargin>();

const badge = "rounded-md px-2 py-0.5 text-xs font-semibold";

function StockCell({ stock }: { stock?: AvailableStock }) {
  if (!stock) return <span className="text-xs text-slate-400">N/A</span>;
  return (
    <div>
      <p className="font-semibold">{stock.unlimited ? "Unlimited" : `₹${stock.available_amount}`}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{stock.stock_count} stock</p>
    </div>
  );
}

export default function RequiredMarginPage() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<RequiredMargin | null>(null);

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["required-margin"],
    queryFn: getRequiredMargin,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRequiredMargin(id),
    onSuccess: () => {
      toast.success("Required margin delete ho gaya 🗑️");
      queryClient.invalidateQueries({ queryKey: ["required-margin"] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const columns = useMemo(
    () => [
      helper.accessor((r) => r.operator?.name ?? "N/A", {
        id: "operator",
        header: "Operator",
        cell: (i) => (
          <div>
            <p className="font-semibold">{i.getValue()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{i.row.original.category?.name}</p>
          </div>
        ),
      }),
      helper.accessor("margin", {
        header: "Margin",
        cell: (i) => (
          <div>
            <p className="font-semibold">{i.getValue()}%</p>
            {i.row.original.fix_margin && <p className="text-xs text-slate-400">Fixed</p>}
          </div>
        ),
      }),
      helper.display({
        id: "available_stock",
        header: "Available Stock",
        cell: (i) => <StockCell stock={i.row.original.available_stock} />,
      }),
      helper.display({
        id: "available_stock_at_margin",
        header: "Stock @ Margin",
        cell: (i) => <StockCell stock={i.row.original.available_stock_at_margin} />,
      }),
      helper.accessor("status", {
        header: "Status",
        cell: (i) =>
          i.getValue() ? (
            <span className={cn(badge, "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300")}>On</span>
          ) : (
            <span className={cn(badge, "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300")}>Off</span>
          ),
      }),
      helper.accessor("admin_status", {
        header: "Admin Status",
        cell: (i) =>
          i.getValue() === "ACTIVE" ? (
            <span className={cn(badge, "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300")}>Active</span>
          ) : (
            <span className={cn(badge, "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300")}>{i.getValue()}</span>
          ),
      }),
      helper.display({
        id: "actions",
        header: "Actions",
        cell: (i) => {
          const r = i.row.original;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(r)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-200 dark:hover:bg-brand-600/20"
              >
                <Pencil className="size-3.5" /> Edit
              </button>
              <button
                disabled={remove.isPending && remove.variables === r.id}
                onClick={() => {
                  if (window.confirm(`${r.operator?.name ?? "Ye"} required margin delete karna hai?`)) remove.mutate(r.id);
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
            <Percent className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Required Margin</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Operator-wise required margin aur available stock</p>
          </div>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add Margin
        </Button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-bold">Margin Settings</h2>
        </div>
        <div className="p-1">
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ) : isError ? (
            <div className="p-5 text-sm text-red-600 dark:text-red-300">
              Required margin load nahi hua.{" "}
              <button onClick={() => refetch()} className="font-semibold underline">Retry</button>
            </div>
          ) : (
            <DataTable columns={columns} data={data} emptyText="Abhi koi margin setting nahi hai — Add Margin dabao" />
          )}
        </div>
      </section>

      {adding && <MarginFormModal onClose={() => setAdding(false)} />}
      {editing && <MarginEditModal row={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

// ───────────── Shared form bits ─────────────

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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <input
        type="checkbox"
        className="size-4 accent-brand-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function Modal({
  title,
  subtitle,
  onClose,
  onSubmit,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>
        <div className="grid flex-1 gap-4 overflow-y-auto p-6">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/10">{footer}</div>
      </form>
    </div>
  );
}

// ───────────── Naya required margin ─────────────

function MarginFormModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [apiId, setApiId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [margin, setMargin] = useState("");
  const [status, setStatus] = useState(true);

  const apisQuery = useApis();
  const categoriesQuery = useCategories();
  // Categories API fail ho toh DEMO category se kaam chalate hain
  const categories = useMemo<Category[]>(
    () => (categoriesQuery.isError ? [DEMO_CATEGORY] : categoriesQuery.data ?? []),
    [categoriesQuery.isError, categoriesQuery.data]
  );
  // Operator list ki alag API nahi hai — API + category ke mapping se operators milte hain
  const operatorsQuery = useOperatorMappings(apiId, categoryId);
  const operators = operatorsQuery.data ?? [];

  const save = useMutation({
    mutationFn: (input: RequiredMarginInput) => createRequiredMargin(input),
    onSuccess: () => {
      toast.success("Required margin add ho gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["required-margin"] });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorId) return toast.error("Operator chuno");
    const m = Number(margin);
    if (margin.trim() === "" || Number.isNaN(m)) return toast.error("Sahi margin daalo");
    save.mutate({ operator_id: operatorId, margin: m, status });
  };

  return (
    <Modal
      title="Add Required Margin"
      subtitle="Operator ke liye required margin set karo"
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>Save Margin</Button>
        </>
      }
    >
      <Select
        label="API"
        value={apiId}
        disabled={apisQuery.isLoading}
        onChange={(v) => {
          setApiId(v);
          setOperatorId("");
        }}
      >
        <option value="">{apisQuery.isLoading ? "Loading..." : "Select API"}</option>
        {(apisQuery.data ?? []).map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </Select>

      <Select
        label="Category"
        value={categoryId}
        disabled={categoriesQuery.isLoading}
        onChange={(v) => {
          setCategoryId(v);
          setOperatorId("");
        }}
      >
        <option value="">{categoriesQuery.isLoading ? "Loading..." : "Select Category"}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </Select>

      <Select
        label="Operator"
        value={operatorId}
        disabled={!apiId || !categoryId || operatorsQuery.isFetching}
        onChange={setOperatorId}
      >
        <option value="">
          {!apiId || !categoryId
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

      <Input
        label="Margin (%)"
        name="margin"
        inputMode="decimal"
        value={margin}
        placeholder="e.g. 1.5"
        onChange={(e) => setMargin(e.target.value)}
      />
      <Toggle label="Status (On)" checked={status} onChange={setStatus} />
    </Modal>
  );
}

// ───────────── Required margin edit ─────────────

function MarginEditModal({ row, onClose }: { row: RequiredMargin; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [margin, setMargin] = useState(String(row.margin ?? ""));
  const [status, setStatus] = useState(Boolean(row.status));
  const [fixMargin, setFixMargin] = useState(Boolean(row.fix_margin));

  const save = useMutation({
    mutationFn: (input: RequiredMarginUpdateInput) => updateRequiredMargin(row.id, input),
    onSuccess: () => {
      toast.success("Required margin update ho gaya ✅");
      queryClient.invalidateQueries({ queryKey: ["required-margin"] });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(margin);
    if (margin.trim() === "" || Number.isNaN(m)) return toast.error("Sahi margin daalo");
    save.mutate({ margin: m, status, fix_margin: fixMargin });
  };

  return (
    <Modal
      title="Edit Required Margin"
      subtitle={`${row.operator?.name ?? "Operator"}${row.category?.name ? ` · ${row.category.name}` : ""}`}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>Update Margin</Button>
        </>
      }
    >
      <Input
        label="Margin (%)"
        name="margin"
        inputMode="decimal"
        value={margin}
        placeholder="e.g. 2.5"
        onChange={(e) => setMargin(e.target.value)}
      />
      <Toggle label="Status (On)" checked={status} onChange={setStatus} />
      <Toggle label="Fix Margin" checked={fixMargin} onChange={setFixMargin} />
    </Modal>
  );
}
