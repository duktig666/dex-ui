"use client";

import { LenisProvider } from "@/components/providers/LenisProvider";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Partners } from "@/components/sections/Partners";
import { TradeCrypto } from "@/components/sections/TradeCrypto";
import { Predictions } from "@/components/sections/Predictions";
import { BorderlessCard } from "@/components/sections/BorderlessCard";
import { Features } from "@/components/sections/Features";
import { Community } from "@/components/sections/Community";

export default function Home() {
  return (
    <LenisProvider>
      <Navigation />
      <main>
        <Hero />
        <Stats />
        <Partners />
        <TradeCrypto />
        <Predictions />
        <BorderlessCard />
        <Features />
        <Community />
      </main>
      <Footer />
    </LenisProvider>
  );
}
