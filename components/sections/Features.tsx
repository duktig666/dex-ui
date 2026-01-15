"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Trading interface mockup
function TradingMockup() {
  return (
    <div className="bg-bg-secondary rounded-xl p-4 h-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <span className="text-orange-400 text-sm font-bold">₿</span>
          </div>
          <span className="text-white font-medium">BTC-PERP</span>
        </div>
        <span className="text-accent-green text-sm font-mono">$97,432.50</span>
      </div>
      
      {/* Chart area */}
      <div className="h-32 flex items-end gap-1 mb-4">
        {[30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 85].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-accent-green/30 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      
      {/* Bottom actions */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-accent-green/20 text-accent-green text-sm font-medium rounded-lg">
          Long
        </button>
        <button className="flex-1 py-2 bg-accent-red/20 text-accent-red text-sm font-medium rounded-lg">
          Short
        </button>
      </div>
    </div>
  );
}

// Wallet icons mockup
function WalletIcons() {
  const tokens = [
    { symbol: "ETH", color: "bg-purple-500/20", textColor: "text-purple-400" },
    { symbol: "BTC", color: "bg-orange-500/20", textColor: "text-orange-400" },
    { symbol: "USDC", color: "bg-blue-500/20", textColor: "text-blue-400" },
    { symbol: "SOL", color: "bg-gradient-to-br from-purple-500/20 to-cyan-500/20", textColor: "text-cyan-400" },
    { symbol: "ARB", color: "bg-blue-600/20", textColor: "text-blue-400" },
    { symbol: "OP", color: "bg-red-500/20", textColor: "text-red-400" },
  ];

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {tokens.map((token) => (
        <motion.div
          key={token.symbol}
          whileHover={{ scale: 1.1 }}
          className={`w-14 h-14 rounded-full ${token.color} border border-white/10 flex items-center justify-center`}
        >
          <span className={`text-xs font-bold ${token.textColor}`}>{token.symbol}</span>
        </motion.div>
      ))}
    </div>
  );
}

// Device mockup
function DeviceMockup() {
  return (
    <div className="flex gap-6 items-end justify-center mt-6">
      {/* Desktop */}
      <div className="w-40 h-28 bg-bg-secondary rounded-lg border border-border-color p-2">
        <div className="w-full h-full rounded bg-bg-card flex items-center justify-center">
          <div className="w-3/4 h-1/2 bg-accent-green/20 rounded" />
        </div>
      </div>
      {/* Mobile */}
      <div className="w-16 h-28 bg-bg-secondary rounded-xl border border-border-color p-1.5">
        <div className="w-full h-full rounded-lg bg-bg-card flex items-center justify-center">
          <div className="w-3/4 h-1/4 bg-accent-green/20 rounded" />
        </div>
      </div>
    </div>
  );
}

// HyENA visual
function HyenaVisual() {
  return (
    <div className="bg-bg-secondary rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 via-transparent to-purple-500/10" />
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-green/30 to-accent-green/10 border border-accent-green/30 flex items-center justify-center">
          <span className="text-3xl font-gilroy font-bold text-accent-green">H</span>
        </div>
        <p className="text-text-secondary text-sm">HyENA Trading Engine</p>
      </div>
      
      {/* Floating particles */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-accent-green/30"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-purple-500/30"
      />
    </div>
  );
}

const features = [
  {
    tag: "Built on Hermes",
    title: "Hermes powers HyENA.trade",
    titleLink: { text: "HyENA.trade", href: "https://hyena.trade" },
    description: "A USDe-margined perpetuals DEX built on Hyperliquid's HIP-3 standard. Trade any asset on earth 24/7 with maximum capital efficiency.",
    secondaryDescription: "HyENA combines Hyperliquid's proven high-performance and user-friendly features with USDe as trading collateral. Expand your trading horizons with premarket perpetuals for assets that don't yet have spot listings.",
    visual: <HyenaVisual />,
    fullWidth: true,
  },
  {
    tag: "Optimize your trading",
    title: "Perpetual and Spot Trading, Built for Speed, Clarity and Control",
    description: "Stay on top of your trades, monitor positions and get push notifications when orders are executed. Enjoy one tap position management, automated TP SL execution, charts and more.",
    secondaryDescription: "Do more on HERMES with advanced order types such as scale, scalp and TWAP. Secure profits with trailing stop loss.",
    visual: <TradingMockup />,
  },
  {
    tag: "Self-custodial Wallet",
    title: "Your Keys, Your Crypto, Your Freedom",
    description: "Hermes gives you real ownership of your crypto without the usual friction. Your wallet is yours alone. We don't hold your keys, and no one else can access your assets. Log in using your email or Google account through Privy.",
    visual: <WalletIcons />,
  },
  {
    tag: "Multi-channel Availability",
    title: "Stay Based. Wherever You Need It.",
    description: "Access Hermes across web, desktop app and mobile. Stay connected to your wallet anytime, anywhere.",
    visual: <DeviceMockup />,
  },
];

export function Features() {
  return (
    <section className="py-32 bg-bg-primary">
      <div className="max-w-content mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm text-text-secondary uppercase tracking-widest mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-gilroy font-bold text-white"
          >
            Trusted by thousands of customers worldwide.
          </motion.h2>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`
                bg-bg-card border border-border-color rounded-2xl p-8
                ${feature.fullWidth ? "col-span-2" : ""}
              `}
            >
              {/* Feature content */}
              <div className={feature.fullWidth ? "grid grid-cols-2 gap-8" : ""}>
                {/* Visual */}
                {feature.fullWidth && feature.visual}

                {/* Text content */}
                <div>
                  <p className="text-sm text-accent-green uppercase tracking-widest mb-3">
                    {feature.tag}
                  </p>
                  <h3 className="text-2xl font-gilroy font-bold text-white mb-4">
                    {feature.titleLink ? (
                      <>
                        Hermes powers{" "}
                        <Link
                          href={feature.titleLink.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-green hover:underline inline-flex items-center gap-1"
                        >
                          {feature.titleLink.text}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </>
                    ) : (
                      feature.title
                    )}
                  </h3>
                  <p className="text-text-secondary mb-4">{feature.description}</p>
                  {feature.secondaryDescription && (
                    <p className="text-text-secondary text-sm">{feature.secondaryDescription}</p>
                  )}

                  {/* Visual for non-fullwidth cards */}
                  {!feature.fullWidth && feature.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
