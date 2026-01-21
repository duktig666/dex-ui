"use client";

import { CURRENT_NETWORK } from "@/lib/hyperliquid/constants";

/**
 * 测试网提示横幅
 * 仅在测试网环境下显示
 */
export function TestnetBanner() {
  if (!CURRENT_NETWORK.isTestnet) {
    return null;
  }

  const faucetUrl = 'faucetUrl' in CURRENT_NETWORK ? CURRENT_NETWORK.faucetUrl : undefined;

  return (
    <div className="w-full bg-[#f7a600]/10 border-b border-[#f7a600]/30 py-1.5 px-4">
      <p className="text-center text-sm text-[#f7a600]">
        You&apos;re currently on the <span className="font-semibold">testnet</span>.
        {faucetUrl && (
          <>
            {" "}Click{" "}
            <a
              href={faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#ffc107] transition-colors"
            >
              here
            </a>{" "}
            for mock USDC.
          </>
        )}
      </p>
    </div>
  );
}
