"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function BorderlessCard() {
  return (
    <section className="py-32 bg-bg-primary relative overflow-hidden">
      <div className="max-w-content mx-auto px-6">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl font-gilroy font-bold text-white mb-4"
            >
              Borderless Spending
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-text-secondary mb-8"
            >
              Load crypto. Tap Visa. 90M+ merchants.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Button variant="outline" size="lg">
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </motion.div>
          </div>

          {/* Right side - Card Grid Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Card grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 21 }).map((_, i) => {
                const isCard = i === 3 || i === 10 || i === 17;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.02 }}
                    className={`
                      aspect-[3/2] rounded-lg
                      ${isCard
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 shadow-xl"
                        : "bg-bg-card/50 border border-border-color/30"
                      }
                    `}
                  >
                    {isCard && (
                      <div className="h-full p-2 flex flex-col justify-between">
                        <div className="w-4 h-3 bg-yellow-500/80 rounded-sm" />
                        <div className="text-[6px] text-text-secondary font-mono">
                          HERMES
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-lg text-text-secondary mt-16 max-w-2xl mx-auto"
        >
          Break free from traditional payment boundaries. Spend anywhere, anytime,
          without the constraints of the banking systems.
        </motion.p>
      </div>
    </section>
  );
}

