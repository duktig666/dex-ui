'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HermesLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export function HermesLogo({ className, size = 'md', animated = true }: HermesLogoProps) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };

  const letters = 'HERMES'.split('');

  return (
    <div className={cn('font-gilroy font-extrabold tracking-tight', sizes[size], className)}>
      {animated ? (
        <motion.div className="flex">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className="inline-block bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent"
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      ) : (
        <span className="bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
          HERMES
        </span>
      )}
    </div>
  );
}

export function HermesLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-8 h-8', className)}
    >
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      <path d="M8 10h4v12H8V10zm6 0h4v4.5h4V10h4v12h-4v-4.5h-4V22h-4V10z" fill="white" />
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1a1a1a" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
      </defs>
    </svg>
  );
}
