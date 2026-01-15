"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const partners = [
  { name: "Ethena", href: "https://ethena.fi/", logo: "ETHENA" },
  { name: "Spartan", href: "https://www.spartangroup.io/", logo: "SPARTAN" },
  { name: "Hashed", href: "https://www.hashed.com/", logo: "HASHED" },
  { name: "Delphi", href: "https://delphiventures.io/", logo: "DELPHI" },
  { name: "Newman", href: "https://newmancapital.com/", logo: "NEWMAN" },
];

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

        <div className="flex items-center justify-center gap-12">
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
                className="block opacity-50 hover:opacity-100 transition-opacity duration-300"
              >
                <span className="font-gilroy font-bold text-xl text-white tracking-wider">
                  {partner.logo}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

