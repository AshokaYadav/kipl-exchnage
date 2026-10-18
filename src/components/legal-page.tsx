import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";

export function LegalPage({ title, sections }: { title: string; sections: { h: string; p: string }[] }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#070b1f]">
      <header className="border-b border-slate-200 dark:border-white/10">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-white">
              <ArrowLeft className="size-4" /> Home
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{siteConfig.company} · {siteConfig.brand}</p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
          Note: Yeh sample text hai. Live karne se pehle apne lawyer/CA se final policy likhwa lo.
        </p>
      </main>
    </div>
  );
}
