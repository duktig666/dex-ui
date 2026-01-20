"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

// Mock trading interface component
function TradingInterface() {
  return (
    <div className="relative w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <Image
          src="/images/trading/trading-app.png"
          alt="Trading Interface"
          width={600}
          height={400}
          className="w-full h-auto rounded-xl shadow-2xl border border-border-color"
          priority
        />
      </motion.div>
    </div>
  );
}

export function TradeCrypto() {
  return (
    <section className="py-32 bg-bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        {/* Radial gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-accent-green/10 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-content mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 gap-16 items-center">
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
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

          {/* Right content - Trading Interface */}
          <div className="flex justify-center">
            <TradingInterface />
          </div>
        </div>
      </div>
    </section>
  );
}
