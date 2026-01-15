"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const timeRanges = ["24H", "7D", "30D", "ALL"];

const markets = [
  { name: "No change", volume: "$36.8M", change: -1, price: "95¢", outcome: "no-change" },
  { name: "25 bps decrease", volume: "$37.1M", change: 1, price: "5¢", outcome: "25-bps-decrease" },
  { name: "50+ bps decrease", volume: "$135.0M", change: 0, price: "0¢", outcome: "50-bps-decrease" },
  { name: "25+ bps increase", volume: "$133.9M", change: 0, price: "0¢", outcome: "25-bps-increase" },
];

export function Predictions() {
  const [selectedRange, setSelectedRange] = useState("30D");

  return (
    <section className="py-32 bg-bg-secondary">
      <div className="max-w-content mx-auto px-6">
        <div className="grid grid-cols-2 gap-16">
          {/* Left side - Introduction */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm text-accent-green uppercase tracking-widest mb-4"
            >
              Introducing
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-gilroy font-bold text-white mb-4"
            >
              Hermes Predictions
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary mb-8"
            >
              Any event. Any outcome. Any time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="primary" size="lg">
                Start Predicting
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </motion.div>

            {/* Prediction avatars */}
            <div className="flex gap-4 mt-12">
              <div className="relative w-32 h-32 rounded-xl bg-bg-card border border-border-color overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent" />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent-green text-black text-xs font-bold rounded">
                  YES
                </div>
              </div>
              <div className="relative w-32 h-32 rounded-xl bg-bg-card border border-border-color overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent" />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent-red text-white text-xs font-bold rounded">
                  NO
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Featured Market Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-bg-card border border-border-color rounded-2xl p-6"
          >
            {/* Market header */}
            <div className="mb-6">
              <p className="text-sm text-text-secondary mb-1">Featured Market</p>
              <h3 className="text-2xl font-gilroy font-bold text-white mb-2">
                Fed decision in January?
              </h3>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>Vol: $342.8M</span>
                <span>•</span>
                <span>Jan 28, 2026</span>
              </div>
            </div>

            {/* Price history */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-text-secondary">Price History</p>
                  <p className="text-xs text-text-secondary">No change</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold text-white">95¢</p>
                  <p className="text-sm text-accent-red">▼ 1% 24h</p>
                </div>
              </div>

              {/* Time range selector */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-accent-green text-sm">+24.0%</span>
                  <span className="text-text-secondary text-xs">30D</span>
                </div>
                <div className="flex gap-1">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range)}
                      className={cn(
                        "px-3 py-1 text-xs rounded-md transition-colors",
                        selectedRange === range
                          ? "bg-white/10 text-white"
                          : "text-text-secondary hover:text-white"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="h-32 bg-bg-secondary rounded-lg flex items-end justify-around px-4 pb-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-accent-green/30 rounded-t"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Market options */}
            <div className="space-y-2">
              {markets.map((market) => (
                <div
                  key={market.name}
                  className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm text-white font-medium">{market.name}</p>
                    <p className="text-xs text-text-secondary">{market.volume}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-medium",
                        market.change > 0 ? "text-accent-green" : market.change < 0 ? "text-accent-red" : "text-text-secondary"
                      )}>
                        {market.change > 0 ? "▲" : market.change < 0 ? "▼" : ""} {Math.abs(market.change)}%
                      </p>
                      <p className="text-sm font-mono text-white">{market.price}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="px-3 py-1 text-xs bg-accent-green/20 text-accent-green rounded hover:bg-accent-green/30 transition-colors">
                        Yes
                      </button>
                      <button className="px-3 py-1 text-xs bg-accent-red/20 text-accent-red rounded hover:bg-accent-red/30 transition-colors">
                        No
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

