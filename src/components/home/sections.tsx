import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Headphones,
  Layers,
  Mail,
  MapPin,
  MonitorSmartphone,
  Phone,
  Plug,
  Quote,
  SlidersHorizontal,
  Workflow,
  Zap,
} from "lucide-react";
import { siteConfig } from "@/config/site";

/* ---------------- Services ---------------- */
const services = [
  {
    icon: Plug,
    title: "Seamless API Connectivity",
    text: "Connect your recharge API with flexible parameters, custom request mapping, callback support and instant API testing.",
  },
  {
    icon: SlidersHorizontal,
    title: "Flexible Margin & Stock Control",
    text: "Set your own margins and manage stock. Configure operator- and circle-wise pricing while buyers see the best rates live.",
  },
  {
    icon: Workflow,
    title: "Smart Order & Dispute Management",
    text: "Orders, responses, disputes and refunds handled in one streamlined system — less manual work, more control.",
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-widest text-brand-600">OUR SERVICES</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            One exchange for every recharge
          </h2>
          <p className="mt-4 text-slate-600">
            Connect your network, manage your stock, control your margins and
            automate your B2B recharge business.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-600/5">
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <s.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */
const aboutPoints = [
  "All types of recharges — Special, Validity, 3G/4G & Flexi — for mobile, DTH and data cards.",
  "Direct operator rates with transparent margins on every successful recharge.",
  "A reliable, fast platform built for seamless transactions.",
];

const stats = [
  { value: "24×7", label: "Support for every user query and issue" },
  { value: "<2s", label: "RESTful API response on web or mobile" },
  { value: "All", label: "Platforms — web, Android, iOS & POS" },
  { value: "B2B", label: "Built for retailers, distributors & API partners" },
];

export function About() {
  return (
    <section id="about" className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-bold tracking-widest text-brand-600">ABOUT {siteConfig.brand.toUpperCase()}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Built like an exchange, priced like a wholesaler
          </h2>
          <p className="mt-4 text-slate-600">
            {siteConfig.brand}, operated by {siteConfig.company}, is a tech-driven
            recharge platform built for businesses across India. We connect you
            to operator rates with clear, transparent commission structures.
          </p>
          <ul className="mt-6 space-y-3">
            {aboutPoints.map((p) => (
              <li key={p} className="flex gap-3 text-slate-700">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-brand-600" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <a href="#contact" className="mt-8 inline-flex items-center gap-2 font-semibold text-brand-600 hover:gap-3 transition-all">
            Learn more about us <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className={i % 3 === 0 ? "rounded-3xl bg-brand-600 p-6 text-white" : "rounded-3xl border border-slate-200 bg-slate-50 p-6"}>
              <p className="text-4xl font-extrabold">{s.value}</p>
              <p className={i % 3 === 0 ? "mt-2 text-sm text-brand-100" : "mt-2 text-sm text-slate-600"}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why us ---------------- */
const why = [
  { icon: Headphones, title: "24×7 Support", text: "Our team is committed to serving you around the clock." },
  { icon: Zap, title: "Instant Response", text: "RESTful APIs deliver fast responses on web or mobile requests." },
  { icon: MonitorSmartphone, title: "Built for Every Platform", text: "Whatever your app is built on, we integrate without friction." },
  { icon: Layers, title: "Two Dashboard Layouts", text: "Work your way — switch between sidebar and top navigation anytime." },
];

export function WhyUs() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-widest text-brand-600">GROW YOUR BUSINESS</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Why choose {siteConfig.brand}</h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((w) => (
            <div key={w.title} className="rounded-3xl border border-slate-200 bg-white p-6">
              <w.icon className="size-7 text-brand-600" />
              <h3 className="mt-4 font-bold">{w.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{w.text}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <figure className="mx-auto mt-16 max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <Quote className="mx-auto size-8 text-brand-200" />
          <blockquote className="mt-4 text-xl font-semibold text-slate-800">
            “Switching to {siteConfig.brand} cut our monthly recharge costs immediately.”
          </blockquote>
          <figcaption className="mt-5 flex items-center justify-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">RS</span>
            <span className="text-left text-sm">
              <span className="block font-semibold">Rakesh Sharma</span>
              <span className="text-slate-500">Retail Partner, Lucknow</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ---------------- CTA + Contact ---------------- */
export function Contact() {
  const c = siteConfig.contact;
  const items = [
    { icon: Phone, label: "Call us", value: c.phone, href: `tel:${c.phone}` },
    { icon: Mail, label: "Email", value: c.email, href: `mailto:${c.email}` },
    { icon: Mail, label: "Alternate email", value: c.altEmail, href: `mailto:${c.altEmail}` },
    { icon: Clock, label: "Support hours", value: "24 × 7, all days" },
    { icon: MapPin, label: "Company", value: `${siteConfig.company}, ${c.address}` },
  ];

  return (
    <section id="contact" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-950 p-8 text-white sm:p-12">
          <div className="grid-bg absolute inset-0" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to trade on {siteConfig.brand}?</h2>
              <p className="mt-3 text-brand-100">Join today — signup takes less than a minute with mobile OTP.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent-400 px-6 font-semibold text-brand-950 hover:bg-accent-500">
                  Create free account <ArrowRight className="size-4" />
                </Link>
                <Link href="/login" className="inline-flex h-12 items-center rounded-xl border border-white/20 px-6 font-semibold hover:bg-white/10">
                  Login
                </Link>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((i) => {
                const body = (
                  <>
                    <i.icon className="size-5 text-accent-400" />
                    <span className="mt-3 block text-xs text-brand-200">{i.label}</span>
                    <span className="block break-all text-sm font-semibold">{i.value}</span>
                  </>
                );
                return (
                  <li key={i.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    {i.href ? <a href={i.href} className="block hover:opacity-90">{body}</a> : body}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
