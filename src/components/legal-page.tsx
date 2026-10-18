import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";

export function LegalPage({ title, sections }: { title: string; sections: { h: string; p: string }[] }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo />
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600">
            <ArrowLeft className="size-4" /> Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{siteConfig.company} · {siteConfig.brand}</p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-bold">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Note: Yeh sample text hai. Live karne se pehle apne lawyer/CA se final policy likhwa lo.
        </p>
      </main>
    </div>
  );
}
