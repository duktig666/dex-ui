'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const partners = [
  { name: 'Ethena', href: 'https://ethena.fi/' },
  { name: 'Spartan', href: 'https://www.spartangroup.io/' },
  { name: 'Hashed', href: 'https://www.hashed.com/' },
  { name: 'Delphi', href: 'https://delphiventures.io/' },
  { name: 'Newman', href: 'https://newmancapital.com/' },
];

// Partner Logo SVG Components
function PartnerLogo({ name }: { name: string }) {
  const logos: Record<string, string> = {
    Ethena: '/images/partners/ethena.svg',
    Spartan: '/images/partners/spartan.svg',
    Hashed: '/images/partners/hashed.svg',
    Delphi: '/images/partners/delphi.svg',
    Newman: '/images/partners/newman.svg',
  };

  const src = logos[name];

  if (src) {
    return (
      <div className="relative h-7 w-auto min-w-[100px] flex items-center justify-center">
        <Image
          src={src}
          alt={`${name} logo`}
          height={28}
          width={120}
          className="h-full w-auto object-contain opacity-50 hover:opacity-100 transition-opacity duration-300 invert" // Added invert
        />
      </div>
    );
  }

  return <span className="font-gilroy font-bold text-xl tracking-wider">{name.toUpperCase()}</span>;
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
