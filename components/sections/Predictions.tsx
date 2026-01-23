'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const timeRanges = ['24H', '7D', '30D', 'ALL'];

const markets = [
  { name: 'No change', volume: '$36.8M', change: -1, price: '95¢', outcome: 'no-change' },
  { name: '25 bps decrease', volume: '$37.1M', change: 1, price: '5¢', outcome: '25-bps-decrease' },
  {
    name: '50+ bps decrease',
    volume: '$135.0M',
    change: 0,
    price: '0¢',
    outcome: '50-bps-decrease',
  },
  {
    name: '25+ bps increase',
    volume: '$133.9M',
    change: 0,
    price: '0¢',
    outcome: '25-bps-increase',
  },
];

// Avatar placeholder components
function YesAvatar() {
  return (
    <div className="relative w-32 h-32 rounded-xl border-2 border-accent-green overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.3)]">
      <Image src="/images/predictions/trump.png" alt="Yes Option" fill className="object-cover" />
      {/* Label */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent-green text-black text-xs font-bold rounded z-10">
        YES
      </div>
    </div>
  );
}

function NoAvatar() {
  return (
    <div className="relative w-32 h-32 rounded-xl border-2 border-accent-red overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.3)]">
      <Image src="/images/predictions/powell.png" alt="No Option" fill className="object-cover" />
      {/* Label */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent-red text-white text-xs font-bold rounded z-10">
        NO
      </div>
    </div>
  );
}

// Chart component
function PriceChart() {
  const dataPoints = [65, 68, 72, 70, 75, 78, 80, 82, 85, 88, 90, 92, 91, 93, 95, 94];

  return (
    <div className="h-32 bg-bg-secondary rounded-lg p-4 relative overflow-hidden">
      {/* Y-axis labels */}
      <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between text-xs text-text-secondary py-2">
        <span>100¢</span>
        <span>50¢</span>
        <span>0¢</span>
      </div>

      {/* Chart area */}
      <div className="ml-10 h-full flex items-end">
        <svg viewBox="0 0 160 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Area fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M0,${100 - dataPoints[0]} ${dataPoints.map((p, i) => `L${(i / (dataPoints.length - 1)) * 160},${100 - p}`).join(' ')} L160,100 L0,100 Z`}
            fill="url(#chartGradient)"
          />
          {/* Line */}
          <path
            d={`M0,${100 - dataPoints[0]} ${dataPoints.map((p, i) => `L${(i / (dataPoints.length - 1)) * 160},${100 - p}`).join(' ')}`}
            fill="none"
            stroke="#00ff88"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="absolute bottom-1 left-10 right-2 flex justify-between text-xs text-text-secondary">
        <span>Dec 16</span>
        <span>Jan 1</span>
        <span>Jan 15</span>
      </div>
    </div>
  );
}

export function Predictions() {
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState('30D');

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
              {t('Introducing')}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-gilroy font-bold text-white mb-4"
            >
              {t('Hermes Predictions')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary mb-8"
            >
              {t('Any event. Any outcome. Any time.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="primary" size="lg">
                {t('Start Predicting')}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Button>
            </motion.div>

            {/* Prediction avatars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 mt-12"
            >
              <YesAvatar />
              <NoAvatar />
            </motion.div>
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
              <p className="text-sm text-text-secondary mb-1">{t('Featured Market')}</p>
              <h3 className="text-2xl font-gilroy font-bold text-white mb-2">
                {t('Fed decision in January?')}
              </h3>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>Vol: $342.8M</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Jan 28, 2026
                </span>
              </div>
            </div>

            {/* Price history */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-text-secondary">{t('Price History')}</p>
                  <p className="text-xs text-text-secondary">{t('No change')}</p>
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
                        'px-3 py-1 text-xs rounded-md transition-colors',
                        selectedRange === range
                          ? 'bg-white/10 text-white'
                          : 'text-text-secondary hover:text-white'
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <PriceChart />
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
                      <p
                        className={cn(
                          'text-sm font-medium',
                          market.change > 0
                            ? 'text-accent-green'
                            : market.change < 0
                              ? 'text-accent-red'
                              : 'text-text-secondary'
                        )}
                      >
                        {market.change > 0 ? '▲' : market.change < 0 ? '▼' : ''}{' '}
                        {Math.abs(market.change)}%
                      </p>
                      <p className="text-sm font-mono text-white">{market.price}</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="px-3 py-1 text-xs bg-accent-green/20 text-accent-green rounded hover:bg-accent-green/30 transition-colors">
                        {t('Yes')}
                      </button>
                      <button className="px-3 py-1 text-xs bg-accent-red/20 text-accent-red rounded hover:bg-accent-red/30 transition-colors">
                        {t('No')}
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
