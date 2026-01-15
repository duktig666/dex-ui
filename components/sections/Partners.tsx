"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const partners = [
  { name: "Ethena", href: "https://ethena.fi/" },
  { name: "Spartan", href: "https://www.spartangroup.io/" },
  { name: "Hashed", href: "https://www.hashed.com/" },
  { name: "Delphi", href: "https://delphiventures.io/" },
  { name: "Newman", href: "https://newmancapital.com/" },
];

// Partner Logo SVG Components
function PartnerLogo({ name }: { name: string }) {
  const logos: Record<string, JSX.Element> = {
    Ethena: (
      <svg viewBox="0 0 100 28" className="h-7 w-auto" fill="currentColor">
        <path d="M0 0h12v4H4v8h7v4H4v8h8v4H0V0z" />
        <path d="M16 4h4v20h8v4H16V4z" />
        <path d="M32 0h12v4h-4v24h-4V4h-4V0z" />
        <path d="M48 0h4v12h6V0h4v28h-4V16h-6v12h-4V0z" />
        <path d="M66 0h12v4H70v8h7v4h-7v8h8v4H66V0z" />
        <path d="M82 0h4l6 18V0h4v28h-4l-6-18v18h-4V0z" />
      </svg>
    ),
    Spartan: (
      <svg viewBox="0 0 120 28" className="h-7 w-auto" fill="currentColor">
        <path d="M0 4h8v4h4v4h-4v4h4v4h4v4H8v-4H4v-4h4v-4H4v-4H0V4z" />
        <path d="M20 4h8v4h4v16h-4V12h-4v16h-4V4z" />
        <path d="M36 4h12v4h-4v20h-4V8h-4V4z" />
        <path d="M52 4h8v4h4v8h-4v12h-4V16h-4V4zm4 4v4h4V8h-4z" />
        <path d="M68 4h8v4h4v16h-4V12h-4v12h-4V4zm4 0v4h4V4h-4z" />
        <path d="M84 4h12v4h-4v20h-4V8h-4V4z" />
        <path d="M100 4h12v4h-4v20h-4V8h-4V4zm4 12h4v4h-4v-4z" />
      </svg>
    ),
    Hashed: (
      <svg viewBox="0 0 100 28" className="h-7 w-auto" fill="currentColor">
        <path d="M0 0h4v12h6V0h4v28h-4V16H4v12H0V0z" />
        <path d="M18 4h8v4h4v16h-4V12h-4v16h-4V4zm4 0v4h4V4h-4z" />
        <path d="M34 4h8v4h4v4h-4v4h4v4h4v4H42v-4h-4v-4h4v-4h-4V8h-4V4z" />
        <path d="M54 0h4v12h6V0h4v28h-4V16h-6v12h-4V0z" />
        <path d="M72 0h12v4H76v8h7v4h-7v8h8v4H72V0z" />
        <path d="M88 0h8v4h4v20h-4v4h-8v-4h8V8h-8V0z" />
      </svg>
    ),
    Delphi: (
      <svg viewBox="0 0 100 28" className="h-7 w-auto" fill="currentColor">
        <path d="M0 0h8v4h4v20h-4v4H0V0zm4 4v20h4V4H4z" />
        <path d="M16 0h12v4H20v8h7v4h-7v8h8v4H16V0z" />
        <path d="M32 0h4v24h8v4H32V0z" />
        <path d="M48 0h8v4h4v8h-4v16h-4V12h-4V0zm4 4v4h4V4h-4z" />
        <path d="M64 0h4v12h6V0h4v28h-4V16h-6v12h-4V0z" />
        <path d="M82 0h4v28h-4V0z" />
      </svg>
    ),
    Newman: (
      <svg viewBox="0 0 120 28" className="h-7 w-auto" fill="currentColor">
        <path d="M0 0h4l6 18V0h4v28h-4L4 10v18H0V0z" />
        <path d="M18 0h12v4H22v8h7v4h-7v8h8v4H18V0z" />
        <path d="M34 0h4l3 14 3-14h4l3 14 3-14h4l-5 28h-4l-3-14-3 14h-4L34 0z" />
        <path d="M62 0h4l6 18V0h4v28h-4l-6-18v18h-4V0z" />
        <path d="M80 4h8v4h4v16h-4V12h-4v16h-4V4zm4 0v4h4V4h-4z" />
        <path d="M96 0h4l6 18V0h4v28h-4l-6-18v18h-4V0z" />
      </svg>
    ),
  };

  return logos[name] || <span className="font-gilroy font-bold text-xl tracking-wider">{name.toUpperCase()}</span>;
}

export function Partners() {
  return (
    <section className="py-16 bg-bg-primary border-y border-border-color">
      <div className="max-w-content mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-text-secondary uppercase tracking-widest mb-8"
        >
          Backed By
        </motion.p>

        <div className="flex items-center justify-center gap-16">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/40 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <PartnerLogo name={partner.name} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
