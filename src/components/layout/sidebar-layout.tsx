"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { NavIcon } from "@/components/layout/nav-icon";
import { LayoutSwitch, ThemeToggle, UserMenu } from "@/components/layout/user-menu";
import { dashboardNav } from "@/config/site";
import { useLogout } from "@/hooks/useAuth";
import type { AppUser } from "@/lib/session";
import { cn } from "@/lib/utils";

// 📐 LAYOUT 1 — Left Sidebar
export function SidebarLayout({ user, children }: { user: AppUser | null; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const logout = useLogout();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {dashboardNav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-white/10 text-white" : "text-brand-200 hover:bg-white/5 hover:text-white"
            )}
          >
            <NavIcon name={item.icon} className="size-[18px]" />
            {item.label}
            {active && <span className="ml-auto size-1.5 rounded-full bg-accent-400" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-950 transition-transform dark:border-r dark:border-white/10 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Logo light />
          <button className="text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        {nav}
        <div className="border-t border-white/10 p-3">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-200 hover:bg-white/5 hover:text-white">
            <LogOut className="size-[18px]" /> Logout
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 dark:border-white/10 dark:bg-slate-950/80">
        <button className="grid size-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </button>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <LayoutSwitch />
          <UserMenu user={user} />
        </div>
      </header>

      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
