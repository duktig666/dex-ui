'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

// Credit card component
function CreditCard({ image, isBlueprint = false }: { image: string; isBlueprint?: boolean }) {
  return (
    <div
      className={`aspect-[1.6/1] w-full rounded-xl relative overflow-hidden ${isBlueprint ? 'opacity-60' : 'shadow-2xl'}`}
    >
      <Image src={image} alt="Credit Card" fill className="object-contain" />
    </div>
  );
}

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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
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
            {/* Card grid - 7x3 */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 21 }).map((_, i) => {
                // Position of main cards (center of each row)
                const isMainCard = i === 3 || i === 10 || i === 17;
                const row = Math.floor(i / 7);

                let imageSrc = '/images/cards/hype-blueprint-2.svg';
                if (i === 3) imageSrc = '/images/cards/teal-card.svg';
                if (i === 10) imageSrc = '/images/cards/based-card.svg';
                if (i === 17) imageSrc = '/images/cards/orange-card.png';

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.03,
                      duration: 0.4,
                    }}
                    style={{
                      transform: isMainCard ? `translateZ(${20 - row * 5}px)` : 'none',
                      zIndex: isMainCard ? 10 : 0,
                    }}
                  >
                    <CreditCard image={imageSrc} isBlueprint={!isMainCard} />
                  </motion.div>
                );
              })}
            </div>

            {/* Floating glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-green/10 rounded-full blur-3xl pointer-events-none" />
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
          Break free from traditional payment boundaries. Spend anywhere, anytime, without the
          constraints of the banking systems.
        </motion.p>
      </div>
    </section>
  );
}
