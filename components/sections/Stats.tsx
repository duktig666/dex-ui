"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface StatItemProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Initialize on client side only
    setDisplayValue(0);
  }, []);

  useEffect(() => {
    if (!isInView || displayValue === value) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Show placeholder on server, actual value on client
  if (displayValue === null) {
    return (
      <span ref={ref} className="font-mono tabular-nums">
        {value.toFixed(decimals)}
      </span>
    );
  }

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {displayValue.toFixed(decimals)}
    </span>
  );
}

function StatItem({ label, value, prefix = "", suffix = "", decimals = 0 }: StatItemProps) {
  return (
    <div className="text-center">
      <dt className="text-sm text-text-secondary mb-2 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="text-4xl lg:text-5xl font-gilroy font-bold text-white">
        {prefix}
        <AnimatedNumber value={value} decimals={decimals} />
        {suffix}
      </dd>
    </div>
  );
}

export function Stats() {
  const stats = [
    { label: "Lifetime Trading Volume", value: 60, prefix: ">$", suffix: " billion" },
    { label: "Hermes Users", value: 86200, prefix: "", suffix: "+" },
    { label: "Affiliate Fees Distributed", value: 15, prefix: ">$", suffix: " million" },
  ];

  return (
    <section className="py-24 bg-bg-primary">
      <div className="max-w-content mx-auto px-6">
        <dl className="grid grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <StatItem {...stat} />
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
