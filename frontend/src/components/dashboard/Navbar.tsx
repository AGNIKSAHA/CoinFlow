'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, LayoutDashboard, Gift, ArrowUpRight } from 'lucide-react';
import { useGetCoinBalanceQuery } from '@/store/api/api';
import { formatNumber } from '@/lib/formatters';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: balanceData } = useGetCoinBalanceQuery();
  const coins = balanceData?.data.balance ?? 0;

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: CreditCard },
    { name: 'Rewards', href: '/rewards', icon: Gift },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                CoinFlow
              </span>
              <span className="text-[10px] font-semibold text-blue-400 block -mt-1 tracking-wider uppercase">
                Fintech Dashboard
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Coin Balance Chip */}
          <div className="flex items-center gap-3">
            <Link
              href="/rewards"
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 hover:text-amber-200 transition-all shadow-sm group"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Gift className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-amber-400/80 font-medium block uppercase tracking-wider leading-none">
                  Reward Coins
                </span>
                <span className="text-sm font-bold text-amber-300 leading-none">
                  {formatNumber(coins)} <span className="text-xs font-normal">pts</span>
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
