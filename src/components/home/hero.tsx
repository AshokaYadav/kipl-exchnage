import Link from "next/link";
import { ArrowRight, CheckCircle2, Smartphone, Tv, Headphones } from "lucide-react";

const snapshot = [
  { label: "Prepaid Mobile", status: "Available" },
  { label: "DTH & Cable TV", status: "Available" },
  { label: "Total Services", status: "2 Active" },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-brand-950 text-white">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute -top-40 right-0 size-[500px] rounded-full bg-brand-600/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-brand-100">
            <span className="size-1.5 rounded-full bg-accent-400" />
            Mobile &amp; DTH Recharge Market Place
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your Recharge Network,{" "}
            <span className="text-accent-400">Fully Automated.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-brand-100/90">
            Bring your APIs together, set your desired margins, and automate your
            entire B2B recharge flow. Less manual work, faster orders, smoother
            business.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent-400 px-6 font-semibold text-brand-950 transition hover:bg-accent-500">
              Get Started Now <ArrowRight className="size-4" />
            </Link>
            <a href="#about" className="inline-flex h-12 items-center rounded-xl border border-white/20 px-6 font-semibold text-white transition hover:bg-white/10">
              See How It Works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-brand-100">
            <span className="flex items-center gap-2"><Smartphone className="size-4 text-accent-400" /> Mobile Recharge</span>
            <span className="flex items-center gap-2"><Tv className="size-4 text-accent-400" /> DTH Recharge</span>
            <span className="flex items-center gap-2"><Headphones className="size-4 text-accent-400" /> 24x7 Support</span>
          </div>
        </div>

        {/* Listing snapshot card */}
        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-[0.2em] text-brand-200">LISTING SNAPSHOT</p>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> ACTIVE
              </span>
            </div>
            <ul className="mt-6 divide-y divide-white/10">
              {snapshot.map((s) => (
                <li key={s.label} className="flex items-center justify-between py-4">
                  <span className="font-medium">{s.label}</span>
                  <span className="flex items-center gap-1.5 text-sm text-emerald-300">
                    <CheckCircle2 className="size-4" /> {s.status}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-right text-xs text-brand-200">— verified</p>
          </div>
        </div>
      </div>
    </section>
  );
}
