import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-slate-50 dark:bg-[#070b1f] lg:grid-cols-2">
      {/* Left brand panel */}
      <aside className="relative hidden overflow-hidden bg-brand-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -bottom-40 -left-20 size-[480px] rounded-full bg-brand-600/40 blur-3xl" />
        <Logo light className="relative" />
        <div className="relative">
          <h2 className="text-4xl font-extrabold leading-tight">
            One exchange for <span className="text-accent-400">every recharge.</span>
          </h2>
          <ul className="mt-8 space-y-4 text-brand-100">
            {[
              "Mobile & DTH recharge at operator-direct margins",
              "Connect your own API and sell your stock",
              "Orders, disputes & refunds — fully automated",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <CheckCircle2 className="size-5 shrink-0 text-accent-400" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-brand-300">
          {siteConfig.company} · {siteConfig.contact.phone}
        </p>
      </aside>

      {/* Form side */}
      <main className="relative flex items-center justify-center px-4 py-12">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-md">
          <Logo className="mb-10 lg:hidden" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
