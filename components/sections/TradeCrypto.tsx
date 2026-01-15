"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function TradeCrypto() {
  return (
    <section className="py-32 bg-bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent-green/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-content mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between">
          {/* Left content */}
          <div className="max-w-lg">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-gilroy font-bold text-white mb-4"
            >
              Trade Crypto 24/7
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-text-secondary mb-8"
            >
              Clarity in the Chaos. Perpetual and Spot Trading at your Fingertips.
            </motion.p>
          </div>

          {/* Right content - Button with animation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button variant="primary" size="lg" className="group">
              <span>Start Trading</span>
              <motion.svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </motion.svg>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

