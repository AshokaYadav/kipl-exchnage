"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";
import { getToken } from "@/lib/session";

const links = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact Us", href: "#contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => setLoggedIn(!!getToken()), []);

  return (
    <header className="sticky top-0 z-50">
      {/* Top info strip */}
      <div className="hidden bg-brand-950 text-xs text-brand-100 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-5">
            <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-1.5 hover:text-white">
              <Mail className="size-3.5" /> {siteConfig.contact.email}
            </a>
            <a href={`tel:${siteConfig.contact.phone}`} className="flex items-center gap-1.5 hover:text-white">
              <Phone className="size-3.5" /> {siteConfig.contact.phone}
            </a>
          </div>
          <span className="font-medium tracking-wide">{siteConfig.company}</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Logo />

          <ul className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm font-medium text-slate-600 transition hover:text-brand-600">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            {loggedIn ? (
              <Link href="/dashboard" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Login
                </Link>
                <Link href="/register" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          <button
            className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium text-slate-700">
                {l.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-3">
              {loggedIn ? (
                <Link href="/dashboard" className="col-span-2 rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="rounded-xl border border-slate-300 py-2.5 text-center text-sm font-semibold">
                    Login
                  </Link>
                  <Link href="/register" className="rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
