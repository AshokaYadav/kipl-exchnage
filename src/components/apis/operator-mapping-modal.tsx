"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCategories, useOperatorMappings, useSaveOperatorMappings } from "@/hooks/useApis";
import {
  DEMO_CATEGORY,
  type Category,
  type OperatorMapping,
  type OperatorMappingInput,
  type ProviderApi,
} from "@/services/apis.service";

// Table mein edit hone wali row — surcharge ko boolean bana dete hain
type MappingRow = Omit<OperatorMapping, "surcharge"> & { surcharge: boolean };
type EditableKey = "operator_code" | "circle_code" | "margin" | "margin_type";

const toRow = (m: OperatorMapping): MappingRow => ({
  ...m,
  surcharge: m.surcharge === true || m.surcharge === "true",
  margin_type: (m.margin_type || "percentage").toLowerCase(),
});

const toInput = (r: MappingRow): OperatorMappingInput => ({
  ...(r.id ? { id: r.id } : {}),
  operator_id: r.operator_id,
  category_id: r.category_id,
  operator_code: r.operator_code,
  circle_code: r.circle_code,
  margin: r.margin,
  margin_type: r.margin_type,
  surcharge: r.surcharge,
});

const cellInput =
  "h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-brand-500/20";

// 🔗 Purane "Manage Operator" modal jaisa — category chuno, rows edit karo, ek-ek ya saari save karo
export function OperatorMappingModal({ api, onClose }: { api: ProviderApi; onClose: () => void }) {
  const categoriesQuery = useCategories();
  // Categories API fail ho toh DEMO category se kaam chalate hain
  const usingFallback = categoriesQuery.isError;
  const categories = useMemo<Category[]>(
    () => (usingFallback ? [DEMO_CATEGORY] : categoriesQuery.data ?? []),
    [usingFallback, categoriesQuery.data]
  );

  const [categoryId, setCategoryId] = useState("");
  const [rows, setRows] = useState<MappingRow[]>([]);
  const mappingsQuery = useOperatorMappings(api.id, categoryId);
  const save = useSaveOperatorMappings(api.id);
  const [savingRow, setSavingRow] = useState<string | null>(null);

  // Pehli baar "prepaid" category apne aap select (fallback mein DEMO)
  useEffect(() => {
    if (categoryId || categories.length === 0) return;
    const prepaid =
      categories.find((c) => c.name?.toLowerCase() === "prepaid") ??
      categories.find((c) => c.name?.toLowerCase().includes("prepaid"));
    if (prepaid) setCategoryId(prepaid.id);
  }, [categories, categoryId]);

  // Server data aate hi local editable copy bana lo
  useEffect(() => {
    setRows((mappingsQuery.data ?? []).map(toRow));
  }, [mappingsQuery.data]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const patchRow = (operatorId: string, patch: Partial<MappingRow>) =>
    setRows((prev) => prev.map((r) => (r.operator_id === operatorId ? { ...r, ...patch } : r)));

  const saveRow = (row: MappingRow) => {
    setSavingRow(row.operator_id);
    save.mutate([toInput(row)], { onSettled: () => setSavingRow(null) });
  };

  const saveAll = () => {
    if (rows.length === 0) return;
    save.mutate(rows.map(toInput));
  };

  const set = (row: MappingRow, key: EditableKey) => (e: { target: { value: string } }) =>
    patchRow(row.operator_id, { [key]: e.target.value });

  const loading = categoriesQuery.isLoading || mappingsQuery.isFetching;
  const savingAll = save.isPending && savingRow === null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-white/10">
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold">
              Manage Operators
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">
                {api.name}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operators ko API codes se jodo, margin set karo aur surcharge / commission mode chuno.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="h-9 px-4">Cancel</Button>
            <Button onClick={saveAll} loading={savingAll} disabled={rows.length === 0 || save.isPending} className="h-9 px-4">
              Save All Mappings
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-950/40">
          {/* Category selector */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between dark:border-white/10 dark:bg-slate-900">
            <div className="w-full sm:w-80">
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category</span>
              <CategoryPicker
                categories={categories}
                value={categoryId}
                loading={categoriesQuery.isLoading}
                onChange={setCategoryId}
              />
              {usingFallback && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Categories load nahi hui — DEMO category use ho rahi hai.
                </p>
              )}
            </div>
            <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 sm:max-w-md dark:bg-white/5 dark:text-slate-400">
              💡 Jitni rows chaho badlo aur upar <span className="font-semibold text-brand-700 dark:text-brand-300">Save All Mappings</span> dabao,
              ya har row ka <span className="font-semibold text-emerald-600 dark:text-emerald-400">Update</span> button use karo.
            </p>
          </div>

          {/* Table */}
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
            {loading && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-white/70 backdrop-blur-[2px] dark:bg-slate-900/70">
                <div className="flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <Loader2 className="size-7 animate-spin text-brand-600" />
                  Loading mappings...
                </div>
              </div>
            )}

            <div className="h-full overflow-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900">
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                    <th className="px-4 py-3 font-semibold">Operator</th>
                    <th className="w-40 px-4 py-3 font-semibold">Operator Code</th>
                    <th className="w-40 px-4 py-3 font-semibold">Circle Code</th>
                    <th className="w-32 px-4 py-3 font-semibold">Margin</th>
                    <th className="w-72 px-4 py-3 font-semibold">Margin Type & Mode</th>
                    <th className="w-24 px-4 py-3 font-semibold">Status</th>
                    <th className="w-28 px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingsQuery.isError ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-red-600 dark:text-red-300">
                        Mappings load nahi hui.{" "}
                        <button onClick={() => mappingsQuery.refetch()} className="font-semibold underline">Retry</button>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                        {categoryId ? "Is category mein koi operator nahi mila." : "Upar se category chuno."}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.operator_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5">
                        <td className="px-4 py-3">
                          <p className="font-semibold">{row.operator?.name ?? "N/A"}</p>
                          {!row.mapped && <p className="text-xs text-slate-400">Not mapped</p>}
                        </td>
                        <td className="px-4 py-3">
                          <input className={cellInput} value={row.operator_code ?? ""} placeholder="e.g. OP01" onChange={set(row, "operator_code")} />
                        </td>
                        <td className="px-4 py-3">
                          <input className={cellInput} value={row.circle_code ?? ""} placeholder="e.g. CR01" onChange={set(row, "circle_code")} />
                        </td>
                        <td className="px-4 py-3">
                          <input className={cellInput} value={row.margin ?? ""} placeholder="0.00" inputMode="decimal" onChange={set(row, "margin")} />
                        </td>
                        <td className="px-4 py-3">
                          <select className={cellInput} value={row.margin_type} onChange={set(row, "margin_type")}>
                            <option value="percentage">Percentage</option>
                            <option value="flat">Flat</option>
                          </select>
                          {/* Mode badalte hi row save ho jaati hai (purane modal jaisa) */}
                          <div className="mt-2 flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                            {([true, false] as const).map((value) => (
                              <label key={String(value)} className="flex cursor-pointer select-none items-center gap-1.5">
                                <input
                                  type="radio"
                                  name={`surcharge-${row.operator_id}`}
                                  className="size-3.5 cursor-pointer accent-brand-600"
                                  checked={row.surcharge === value}
                                  disabled={save.isPending}
                                  onChange={() => {
                                    patchRow(row.operator_id, { surcharge: value });
                                    saveRow({ ...row, surcharge: value });
                                  }}
                                />
                                {value ? "Surcharge" : "Commission"}
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {row.provider_api?.status ? (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Active</span>
                          ) : (
                            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            onClick={() => saveRow(row)}
                            loading={savingRow === row.operator_id}
                            disabled={save.isPending}
                            className="h-9 w-full px-3 text-xs"
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔍 Search wala category dropdown
function CategoryPicker({
  categories,
  value,
  loading,
  onChange,
}: {
  categories: Category[];
  value: string;
  loading: boolean;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = categories.find((c) => c.id === value);
  const filtered = categories.filter((c) => c.name?.toLowerCase().includes(query.trim().toLowerCase()));

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 text-left text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:opacity-60 dark:border-white/15 dark:bg-slate-900 dark:text-white dark:focus:ring-brand-500/20"
      >
        <span className={cn("truncate", !selected && "text-slate-400")}>
          {loading ? "Loading..." : selected?.name ?? "Select Category"}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-slate-400 transition", open && "rotate-180")} />
      </button>

      {open && (
        <>
          {/* Bahar click karne par band */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 z-40 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
            <div className="relative border-b border-slate-100 p-2 dark:border-white/10">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search category..."
                className="h-9 w-full rounded-lg border border-slate-300 bg-white pr-2 pl-8 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500 dark:border-white/15 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <div className="max-h-56 overflow-y-auto py-1">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pick(c.id)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5",
                      c.id === value ? "font-semibold text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    {c.id === value && <Check className="size-4" />}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-center text-sm text-slate-500 dark:text-slate-400">Koi category nahi mili</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
