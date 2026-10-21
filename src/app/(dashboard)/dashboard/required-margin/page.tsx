"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Percent } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { axiosInstance } from "@/lib/axios";
import { cn } from "@/lib/utils";

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

// 📊 Required margin setting list
const getRequiredMargin = async (): Promise<RequiredMargin[]> => {
  const res = await axiosInstance.get<ApiResponse<RequiredMargin[]>>("/apis/exchange/required-margin");
  if (res.data?.err) throw new Error(res.data.message ?? "Request fail ho gayi");
  return res.data.data ?? [];
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
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["required-margin"],
    queryFn: getRequiredMargin,
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
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
          <Percent className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Required Margin</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Operator-wise required margin aur available stock</p>
        </div>
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
            <DataTable columns={columns} data={data} emptyText="Abhi koi margin setting nahi hai" />
          )}
        </div>
      </section>
    </div>
  );
}
