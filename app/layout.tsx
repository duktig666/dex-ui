import type { Metadata } from "next";
import { Inter, Source_Code_Pro, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"],
  display: "swap",
});

// Using Space Grotesk as alternative to Gilroy (both are geometric sans-serif)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-gilroy",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hermes | Trade everything, spend everywhere",
  description: "Hermes DEX - Trade crypto 24/7 with perpetual and spot trading at your fingertips.",
  keywords: ["DEX", "crypto", "trading", "perpetual", "spot", "Hermes"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceCodePro.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
