import type { Metadata } from 'next';
import { Inter, Source_Code_Pro, Space_Grotesk } from 'next/font/google';
import { headers } from 'next/headers';
import { cookieToInitialState } from 'wagmi';
import { config } from '@/lib/wagmi/config';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { I18nProvider } from '@/lib/i18n';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  variable: '--font-source-code',
  subsets: ['latin'],
  display: 'swap',
});

// Using Space Grotesk as alternative to Gilroy (both are geometric sans-serif)
const spaceGrotesk = Space_Grotesk({
  variable: '--font-gilroy',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hermes | Trade everything, spend everywhere',
  description: 'Hermes DEX - Trade crypto 24/7 with perpetual and spot trading at your fingertips.',
  keywords: ['DEX', 'crypto', 'trading', 'perpetual', 'spot', 'Hermes'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const initialState = cookieToInitialState(config, headersList.get('cookie'));

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceCodePro.variable} ${spaceGrotesk.variable}`}
    >
      <body className="antialiased">
        <I18nProvider>
          <Web3Provider initialState={initialState}>{children}</Web3Provider>
        </I18nProvider>
      </body>
    </html>
  );
}
