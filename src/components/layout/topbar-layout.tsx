"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { NavIcon } from "@/components/layout/nav-icon";
import { LayoutSwitch, ThemeToggle, UserMenu } from "@/components/layout/user-menu";
import { dashboardNav } from "@/config/site";
import type { AppUser } from "@/lib/session";
import { cn } from "@/lib/utils";

// 📐 LAYOUT 2 — Top Navigation
export function TopbarLayout({ user, children }: { user: AppUser | null; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <button className="grid size-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 xl:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Logo />
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <LayoutSwitch />
            <UserMenu user={user} />
          </div>
        </div>

        {/* Horizontal nav (desktop) */}
        <nav className="hidden border-t border-slate-100 bg-brand-950 dark:border-white/10 xl:block">
          <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
            {dashboardNav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition",
                      active ? "border-accent-400 text-white" : "border-transparent text-brand-200 hover:text-white"
                    )}
                  >
                    <NavIcon name={item.icon} className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile dropdown nav */}
        {open && (
          <nav className="grid grid-cols-2 gap-1 border-t border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950 xl:hidden">
            {dashboardNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === item.href ? "bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                )}
              >
                <NavIcon name={item.icon} className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
