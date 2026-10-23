"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { NavIcon } from "@/components/layout/nav-icon";
import { flatDashboardNav } from "@/config/site";

// Payment, Fix Margin, Purchase, ReSeller... sab pages yahan se.
// Kisi page ko alag banana ho toh: src/app/(dashboard)/dashboard/<naam>/page.tsx bana do.
export default function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  const item = flatDashboardNav.find((n) => n.href === `/dashboard/${section}`);
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
          <NavIcon name={item.icon} className="size-5" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">{item.label}</h1>
      </div>
      <div className="grid place-items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 dark:border-white/15 dark:bg-slate-900 py-20 text-center">
        <Construction className="size-10 text-slate-400" />
        <p className="mt-4 font-semibold">{item.label} page ready hai</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Backend API milte hi yahan form / table laga denge. Layout switch upar se try karo.
        </p>
      </div>
    </div>
  );
}
