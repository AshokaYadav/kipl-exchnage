"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { NavIcon } from "@/components/layout/nav-icon";
import { LayoutSwitch, ThemeToggle, UserMenu } from "@/components/layout/user-menu";
import { dashboardNav, type DashboardNavItem } from "@/config/site";
import { useLogout } from "@/hooks/useAuth";
import type { AppUser } from "@/lib/session";
import { cn } from "@/lib/utils";

// Desktop pe sidebar band ho toh label chhup jaye, hover pe dikhe (mobile pe hamesha dikhe)
const labelCls = "whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100";

// 📐 LAYOUT 1 — Left Sidebar
export function SidebarLayout({ user, children }: { user: AppUser | null; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const logout = useLogout();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-4">
      {dashboardNav.map((item) => {
        if (item.children) return <SidebarGroup key={item.href} item={item} pathname={pathname} onNavigate={() => setOpen(false)} />;
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
            <NavIcon name={item.icon} className="size-[18px] shrink-0" />
            <span className={labelCls}>{item.label}</span>
            {active && <span className={cn("ml-auto size-1.5 shrink-0 rounded-full bg-accent-400", labelCls)} />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:pl-[72px]">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar — desktop pe band = sirf icons, hover pe content ke upar overlay hoke khulta hai */}
      <aside
        className={cn(
          "group fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden bg-brand-950 transition-[transform,width] duration-200 dark:border-r dark:border-white/10 lg:w-[72px] lg:translate-x-0 lg:hover:w-64 lg:hover:shadow-2xl",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5 lg:justify-center lg:px-2 lg:group-hover:justify-between lg:group-hover:px-5">
          <Logo light />
          <button className="text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        {nav}
        <div className="border-t border-white/10 p-3">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-200 hover:bg-white/5 hover:text-white">
            <LogOut className="size-[18px] shrink-0" /> <span className={labelCls}>Logout</span>
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

// Sidebar dropdown group (Buyer etc.) — andar ka page active ho toh khula rehta hai
function SidebarGroup({ item, pathname, onNavigate }: { item: DashboardNavItem; pathname: string; onNavigate: () => void }) {
  const active = item.children!.some((c) => c.href === pathname);
  const [expanded, setExpanded] = useState(active);

  return (
    <div>
      <button
        onClick={() => setExpanded((e) => !e)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
          active ? "text-white" : "text-brand-200 hover:bg-white/5 hover:text-white"
        )}
      >
        <NavIcon name={item.icon} className="size-[18px] shrink-0" />
        <span className={labelCls}>{item.label}</span>
        <ChevronDown className={cn("ml-auto size-4 shrink-0 transition", labelCls, expanded && "rotate-180")} />
      </button>
      {expanded && (
        <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3 lg:hidden lg:group-hover:flex">
          {item.children!.map((child) => {
            const childActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  childActive ? "bg-white/10 text-white" : "text-brand-200 hover:bg-white/5 hover:text-white"
                )}
              >
                <NavIcon name={child.icon} className="size-4 shrink-0" />
                <span className="whitespace-nowrap">{child.label}</span>
                {childActive && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-accent-400" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
