"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Moon, PanelLeft, PanelTop, Sun, UserCircle } from "lucide-react";
import Link from "next/link";
import { useLogout } from "@/hooks/useAuth";
import { useLayoutMode } from "@/providers/layout-provider";
import { useTheme } from "@/providers/theme-provider";
import type { AppUser } from "@/lib/session";
import { cn } from "@/lib/utils";

// 🌗 Dark / Light toggle
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      title={dark ? "Light mode" : "Dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:text-slate-900 dark:bg-white/10 dark:text-amber-300 dark:hover:text-amber-200",
        className
      )}
    >
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}

// 🔀 Layout switch button (sidebar ⇄ topbar)
export function LayoutSwitch({ className }: { className?: string }) {
  const { mode, setMode } = useLayoutMode();
  return (
    <div className={cn("flex rounded-xl bg-slate-100 p-1 dark:bg-white/10", className)} role="group" aria-label="Layout">
      {(
        [
          { m: "sidebar", Icon: PanelLeft, label: "Sidebar" },
          { m: "topbar", Icon: PanelTop, label: "Top" },
        ] as const
      ).map(({ m, Icon, label }) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          title={`${label} layout`}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
            mode === m
              ? "bg-white text-brand-700 shadow-sm dark:bg-brand-600 dark:text-white"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          )}
        >
          <Icon className="size-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function UserMenu({ user }: { user: AppUser | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const logout = useLogout();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const name = user?.name ?? "User";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100 dark:hover:bg-white/10">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">{initials}</span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight">{name}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">{user?.mobile ?? user?.role ?? ""}</span>
        </span>
        <ChevronDown className="size-4 text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900">
          <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10">
            <UserCircle className="size-4" /> My Profile
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
