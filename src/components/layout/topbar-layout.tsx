"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { NavIcon } from "@/components/layout/nav-icon";
import { LayoutSwitch, ThemeToggle, UserMenu } from "@/components/layout/user-menu";
import { dashboardNav, type DashboardNavItem } from "@/config/site";
import type { AppUser } from "@/lib/session";
import { cn } from "@/lib/utils";

// 📐 LAYOUT 2 — Top Navigation
export function TopbarLayout({ user, children }: { user: AppUser | null; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto flex h-16 max-w-9xl items-center gap-3 px-4">
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
          <ul className="mx-auto flex  items-center gap-1 overflow-x-auto px-4">
            {/* max-w-7xl */}
            {dashboardNav.map((item) => {
              if (item.children) return <NavDropdown key={item.href} item={item} pathname={pathname} />;
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
            {dashboardNav.map((group) => (
              <Fragment key={group.href}>
                {/* Dropdown group ka naam heading banke dikhta hai */}
                {group.children && (
                  <p className="col-span-2 mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
                )}
                {(group.children ?? [group]).map((item) => (
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
              </Fragment>
            ))}
          </nav>
        )}
      </header>
      {/* max-w-7xl  */}

      <main className="mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}

// Desktop dropdown (Buyer etc.) — nav ul overflow-x-auto hai, isliye menu "fixed" position pe khulta hai
function NavDropdown({ item, pathname }: { item: DashboardNavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = item.children!.some((c) => c.href === pathname);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const toggle = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom, left: r.left });
    setOpen((o) => !o);
  };

  return (
    <li>
      <button
        ref={btnRef}
        onClick={toggle}
        className={cn(
          "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition",
          active ? "border-accent-400 text-white" : "border-transparent text-brand-200 hover:text-white"
        )}
      >
        <NavIcon name={item.icon} className="size-4" />
        {item.label}
        <ChevronDown className={cn("size-3.5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-40 min-w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-slate-900"
        >
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                pathname === child.href
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-200"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              )}
            >
              <NavIcon name={child.icon} className="size-4" />
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}
