"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Clock,
  Landmark,
  Lock,
  MessageSquareWarning,
  Moon,
  ShoppingBag,
  Sun,
  Sunrise,
  Sunset,
  Wallet,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { getDashboard, type StockRow, type TxnRow } from "@/services/dashboard.service";
import { getUser } from "@/lib/session";
import { formatINR } from "@/lib/utils";

const txnHelper = createColumnHelper<TxnRow>();
const stockHelper = createColumnHelper<StockRow>();

function txnColumns(rows: TxnRow[]) {
  const totalAmt = rows.reduce((s, r) => s + r.amount, 0);
  const totalCnt = rows.reduce((s, r) => s + r.count, 0);
  const totalMargin = rows.reduce((s, r) => s + r.margin, 0);
  return [
    txnHelper.accessor("operator", { header: "Operator", footer: "Total" }),
    txnHelper.accessor("amount", {
      header: "Amount (₹)",
      cell: (i) => (
        <span>
          {formatINR(i.getValue())} <span className="text-slate-400 dark:text-slate-500">({i.row.original.count})</span>
        </span>
      ),
      footer: () => `${formatINR(totalAmt)} (${totalCnt})`,
    }),
    txnHelper.accessor("margin", {
      header: "Margin (₹)",
      cell: (i) => <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatINR(i.getValue(), 4)}</span>,
      footer: () => formatINR(totalMargin, 4),
    }),
    txnHelper.accessor("avgPercent", {
      header: "Avg %",
      cell: (i) => `${i.getValue().toFixed(3)}%`,
    }),
  ];
}

const stockColumns = (rows: StockRow[]) => {
  const total = rows.reduce((s, r) => s + r.stock, 0);
  return [
    stockHelper.accessor("operator", { header: "Operator", footer: "Total" }),
    stockHelper.accessor("maxMargin", {
      header: "Max Margin",
      cell: (i) => (
        <span className="rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-200">{i.getValue().toFixed(2)}%</span>
      ),
    }),
    stockHelper.accessor("stock", {
      header: "Available Stock (₹)",
      cell: (i) => formatINR(i.getValue()),
      footer: () => formatINR(total),
    }),
  ];
};

export default function DashboardPage() {
  const user = getUser();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const purchaseCols = useMemo(() => txnColumns(data?.purchases ?? []), [data]);
  const salesCols = useMemo(() => txnColumns(data?.sales ?? []), [data]);
  const stockCols = useMemo(() => stockColumns(data?.stock ?? []), [data]);

  if (isLoading) return <DashboardSkeleton />;
  if (isError || !data)
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        Dashboard load nahi hua.{" "}
        <button onClick={() => refetch()} className="font-semibold underline">Retry</button>
      </div>
    );

  const tiles = [
    { label: "Pending Purchase Txns", value: data.pending.purchaseTxns, icon: Clock, tone: "amber" },
    { label: "Pending Sales Txns", value: data.pending.salesTxns, icon: Clock, tone: "slate" },
    { label: "Purchase Complaints", value: data.pending.purchaseComplaints, icon: MessageSquareWarning, tone: "slate" },
    { label: "Sales Complaints", value: data.pending.salesComplaints, icon: AlertTriangle, tone: "slate" },
  ] as const;

  const money = [
    { label: "Today's Purchase", value: data.today.purchaseTotal, icon: ShoppingBag },
    { label: "Today's Sales", value: data.today.salesTotal, icon: ArrowUpRight },
    { label: "Topup Request", value: data.today.topupRequest, icon: Banknote },
    { label: "Bank Settlement", value: data.today.bankSettlement, icon: Landmark },
    { label: "Block Amount", value: data.today.blockAmount, icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Greeting name={user?.name ?? "Partner"} />
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-300">
          Demo data — connect dashboard API in dashboard.service.ts
        </span>
      </div>

      {/* Wallets */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 p-6 text-white">
          <Wallet className="absolute -right-4 -bottom-4 size-28 opacity-10" />
          <p className="flex items-center gap-2 text-sm text-brand-100"><ArrowDownLeft className="size-4" /> Buyer Wallet</p>
          <p className="mt-2 text-3xl font-extrabold">₹ {formatINR(data.wallet.buyer, 4)}</p>
          <p className="mt-1 text-xs text-brand-200">Isse recharge kharidte ho</p>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-6 text-white dark:bg-slate-900 dark:ring-1 dark:ring-white/10">
          <Wallet className="absolute -right-4 -bottom-4 size-28 opacity-10" />
          <p className="flex items-center gap-2 text-sm text-brand-200"><ArrowUpRight className="size-4" /> Seller Wallet</p>
          <p className="mt-2 text-3xl font-extrabold">₹ {formatINR(data.wallet.seller, 4)}</p>
          <p className="mt-1 text-xs text-brand-300">Recharge bech kar jo aaya</p>
        </div>
      </div>

      {/* Pending tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
            <t.icon className={t.tone === "amber" && t.value > 0 ? "size-5 text-amber-500" : "size-5 text-slate-400"} />
            <p className="mt-3 text-2xl font-extrabold">{t.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Money tiles */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {money.map((m) => (
          <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
            <m.icon className="size-5 text-brand-600 dark:text-brand-400" />
            <p className="mt-3 text-lg font-extrabold">₹ {formatINR(m.value)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Today's Purchase">
          <DataTable columns={purchaseCols} data={data.purchases} />
        </Card>
        <Card title="Today's Sales">
          <DataTable columns={salesCols} data={data.sales} />
        </Card>
      </div>

      <Card title="Available Stock" subtitle="Max margin & total stock per operator">
        <DataTable columns={stockCols} data={data.stock} />
      </Card>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <h2 className="font-bold">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      <div className="p-1">{children}</div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-60 rounded-lg bg-slate-200 dark:bg-white/10" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 rounded-3xl bg-slate-200 dark:bg-white/10" />
        <div className="h-32 rounded-3xl bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-white/10" />
        ))}
      </div>
      <div className="h-72 rounded-3xl bg-slate-200 dark:bg-white/10" />
    </div>
  );
}

// 🌅 Time ke hisaab se greeting (har minute update hoti hai)
function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return { text: "Good Morning", Icon: Sunrise, color: "text-amber-500" };
  if (hour >= 12 && hour < 17) return { text: "Good Afternoon", Icon: Sun, color: "text-orange-500" };
  if (hour >= 17 && hour < 21) return { text: "Good Evening", Icon: Sunset, color: "text-rose-500" };
  return { text: "Good Night", Icon: Moon, color: "text-indigo-400" };
}

function Greeting({ name }: { name: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { text, Icon, color } = getGreeting(now.getHours());
  const date = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex items-center gap-3">
      <span className="grid size-12 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
        <Icon className={`size-6 ${color}`} />
      </span>
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          {text}, {name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{date} · Aaj ka business ek nazar mein.</p>
      </div>
    </div>
  );
}
