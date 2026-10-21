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

// ♻️ Reusable TanStack Table (sorting + footer support)
export function DataTable<T>({
  columns,
  data,
  emptyText = "No records",
}: {
  columns: ColumnDef<T, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  data: T[];
  emptyText?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const hasFooter = columns.some((c) => c.footer);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3 font-semibold">
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
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
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
              <tr key={fg.id} className="border-t-2 border-slate-200 bg-slate-50 font-bold dark:border-white/10 dark:bg-white/5">
                {fg.headers.map((h) => (
                  <td key={h.id} className="px-4 py-3">
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
