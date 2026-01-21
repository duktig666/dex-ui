import type { Metadata } from "next";
import { TestnetBanner } from "@/components/layout/TestnetBanner";

export const metadata: Metadata = {
  title: "Trade | Hermes DEX",
  description: "Trade perpetual contracts on Hermes DEX",
};

export default function TradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0b0e11] flex flex-col">
      <TestnetBanner />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
