"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

// Mock trading interface component
function TradingInterface() {
  return (
    <div className="relative w-full max-w-lg">
      {/* Trading card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-bg-card border border-border-color rounded-2xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-500 font-bold">₿</span>
            </div>
            <div>
              <p className="font-semibold text-white">BTC-PERP</p>
              <p className="text-sm text-accent-green">+2.34%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl font-bold text-white">$97,432.50</p>
            <p className="text-sm text-text-secondary">24h Vol: $1.2B</p>
          </div>
        </div>

        {/* Mini chart */}
        <div className="h-32 mb-6 bg-bg-secondary rounded-xl p-4 flex items-end justify-around gap-1">
          {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 95, 88, 92, 98].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${height}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
              className="w-2 bg-gradient-to-t from-accent-green/50 to-accent-green rounded-t"
            />
          ))}
        </div>

        {/* Order buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button className="py-3 px-4 bg-accent-green/20 text-accent-green font-semibold rounded-xl hover:bg-accent-green/30 transition-colors">
            Long
          </button>
          <button className="py-3 px-4 bg-accent-red/20 text-accent-red font-semibold rounded-xl hover:bg-accent-red/30 transition-colors">
            Short
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border-color">
          <div className="text-center">
            <p className="text-xs text-text-secondary">24h High</p>
            <p className="font-mono text-sm text-white">$98,200</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-secondary">24h Low</p>
            <p className="font-mono text-sm text-white">$95,100</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-secondary">Open Interest</p>
            <p className="font-mono text-sm text-white">$4.2B</p>
          </div>
        </div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="absolute -left-16 top-1/4 bg-bg-card/80 backdrop-blur border border-border-color rounded-xl p-3 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <span className="text-purple-400 text-sm font-bold">Ξ</span>
          </div>
          <div>
            <p className="text-xs text-text-secondary">ETH</p>
            <p className="text-sm font-mono text-accent-green">+1.8%</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
        className="absolute -right-12 bottom-1/4 bg-bg-card/80 backdrop-blur border border-border-color rounded-xl p-3 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-blue-400 text-sm font-bold">◎</span>
          </div>
          <div>
            <p className="text-xs text-text-secondary">SOL</p>
            <p className="text-sm font-mono text-accent-green">+5.2%</p>
          </div>
        </div>
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
