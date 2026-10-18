import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();
  const c = siteConfig.contact;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${siteConfig.company}, ${c.address}`
  )}`;

  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-brand-200">
            A tech-driven B2B recharge exchange focused on alternate payment technologies.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
              { Icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
              { Icon: Twitter, href: siteConfig.social.x, label: "X" },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} className="grid size-9 place-items-center rounded-lg bg-white/5 hover:bg-white/15">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#home" className="hover:text-white">Home</a></li>
            <li><a href="#about" className="hover:text-white">About Us</a></li>
            <li><a href="#services" className="hover:text-white">Services</a></li>
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Services</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Mobile Recharge</li>
            <li>DTH Recharge</li>
            <li>Recharge API</li>
            <li>B2B Exchange</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contact Us</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-white">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="block font-semibold text-white">{siteConfig.company}</span>
                  {c.addressLines.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </span>
              </a>
            </li>
            <li>
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white">
                <Phone className="size-4 shrink-0" /> {c.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 break-all hover:text-white">
                <Mail className="size-4 shrink-0" /> {c.email}
              </a>
            </li>
          </ul>
        </div>

      </div>
        <div className="col-span-full text-center text-sm text-brand-200 mb-4">
          <p>Made with ❤️ in India 🇮🇳</p>
        </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-brand-300">
          © {year} · {siteConfig.company}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}