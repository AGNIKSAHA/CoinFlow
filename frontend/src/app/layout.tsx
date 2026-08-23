import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/providers/StoreProvider';
import { Navbar } from '@/components/dashboard/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CoinFlow — Credit Card Rewards & Spending Dashboard',
  description: 'Full-stack financial dashboard for tracking transactions, spending analytics, and redeeming credit card reward coins.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <StoreProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-950">
            <p>© 2026 CoinFlow Financial Inc. Digital Alpha Technologies Assessment Implementation.</p>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
