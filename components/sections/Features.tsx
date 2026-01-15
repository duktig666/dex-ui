"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    tag: "Built on Hermes",
    title: "Hermes powers HyENA.trade",
    titleLink: { text: "HyENA.trade", href: "https://hyena.trade" },
    description: "A USDe-margined perpetuals DEX built on Hyperliquid's HIP-3 standard. Trade any asset on earth 24/7 with maximum capital efficiency.",
    secondaryDescription: "HyENA combines Hyperliquid's proven high-performance and user-friendly features with USDe as trading collateral. Expand your trading horizons with premarket perpetuals for assets that don't yet have spot listings.",
    hasIframe: true,
  },
  {
    tag: "Optimize your trading",
    title: "Perpetual and Spot Trading, Built for Speed, Clarity and Control",
    description: "Stay on top of your trades, monitor positions and get push notifications when orders are executed. Enjoy one tap position management, automated TP SL execution, charts and more.",
    secondaryDescription: "Do more on HERMES with advanced order types such as scale, scalp and TWAP. Secure profits with trailing stop loss.",
    hasImage: true,
  },
  {
    tag: "Self-custodial Wallet",
    title: "Your Keys, Your Crypto, Your Freedom",
    description: "Hermes gives you real ownership of your crypto without the usual friction. Your wallet is yours alone. We don't hold your keys, and no one else can access your assets. Log in using your email or Google account through Privy.",
    hasWalletIcons: true,
  },
  {
    tag: "Multi-channel Availability",
    title: "Stay Based. Wherever You Need It.",
    description: "Access Hermes across web, desktop app and mobile. Stay connected to your wallet anytime, anywhere.",
    hasDevices: true,
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
                ${index === 0 ? "col-span-2" : ""}
              `}
            >
              {/* Feature content */}
              <div className={index === 0 ? "grid grid-cols-2 gap-8" : ""}>
                {/* Visual placeholder */}
                {feature.hasIframe && (
                  <div className="bg-bg-secondary rounded-xl h-64 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-accent-green/10 to-transparent rounded-xl" />
                  </div>
                )}

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
                </div>

                {/* Visual placeholders for different types */}
                {feature.hasImage && !feature.hasIframe && (
                  <div className="bg-bg-secondary rounded-xl h-48 mt-6 flex items-center justify-center">
                    <div className="text-text-secondary text-sm">Trading Interface Preview</div>
                  </div>
                )}

                {feature.hasWalletIcons && (
                  <div className="flex gap-4 mt-6">
                    {["ETH", "BTC", "USDC", "SOL", "ARB", "OP"].map((token) => (
                      <div
                        key={token}
                        className="w-12 h-12 rounded-full bg-bg-secondary border border-border-color flex items-center justify-center text-xs font-mono text-text-secondary"
                      >
                        {token}
                      </div>
                    ))}
                  </div>
                )}

                {feature.hasDevices && (
                  <div className="flex gap-4 mt-6 items-end justify-center">
                    <div className="w-32 h-48 bg-bg-secondary rounded-lg border border-border-color" />
                    <div className="w-20 h-40 bg-bg-secondary rounded-xl border border-border-color" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

