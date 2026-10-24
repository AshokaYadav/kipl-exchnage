"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ♻️ Reusable TanStack Table (sorting + footer support)
export function DataTable<T>({
  columns,
  data,
  emptyText = "No records",
  getRowId,
  bordered = false,
  className,
}: {
  columns: ColumnDef<T, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  data: T[];
  emptyText?: string;
  getRowId?: (row: T) => string;
  bordered?: boolean; // grid borders + zebra rows + bold header
  className?: string; // e.g. max-h-* dene se table khud scroll hogi (header sticky rahega)
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const hasFooter = columns.some((c) => c.footer);

  return (
    <div className={cn("overflow-auto", bordered && "rounded-2xl border border-slate-200 dark:border-white/10", className)}>
      <table className="w-full min-w-[480px] border-separate border-spacing-0 text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              className={cn(
                "text-left text-xs uppercase tracking-wide",
                bordered ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400",
              )}
            >
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className={cn(
                    "border-b px-4 py-3",
                    bordered
                      ? "sticky top-0 z-10 whitespace-nowrap border-r border-slate-200 bg-slate-100 font-bold tracking-wider last:border-r-0 dark:border-white/10 dark:bg-slate-800"
                      : "border-slate-200 font-semibold dark:border-white/10",
                  )}
                >
                  {h.isPlaceholder ? null : h.column.getCanSort() ? (
                    <button onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      <ArrowUpDown className="size-3" />
                    </button>
                  ) : (
                    flexRender(h.column.columnDef.header, h.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "group transition-colors",
                  bordered
                    ? "even:bg-slate-50/70 hover:bg-brand-50/70 dark:even:bg-white/[0.02] dark:hover:bg-brand-600/10"
                    : "hover:bg-slate-50 dark:hover:bg-white/5",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      "border-b border-slate-100 px-4 group-last:border-b-0 dark:border-white/5",
                      bordered ? "border-r py-3.5 align-middle text-slate-700 last:border-r-0 dark:text-slate-200" : "py-3",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {hasFooter && (
          <tfoot>
            {table.getFooterGroups().map((fg) => (
              <tr key={fg.id} className="bg-slate-50 font-bold dark:bg-white/5">
                {fg.headers.map((h) => (
                  <td key={h.id} className={cn("border-t-2 border-slate-200 px-4 py-3 dark:border-white/10", bordered && "border-r last:border-r-0")}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.footer, h.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>
    </div>
  );
}
