'use client';

import React from 'react';
import Link from 'next/link';
import { Coins, Sparkles, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import { useGetCoinBalanceQuery } from '@/store/api/api';
import { formatNumber } from '@/lib/formatters';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export interface CoinBalanceCardProps {
  showRedeemButton?: boolean;
}

export const CoinBalanceCard: React.FC<CoinBalanceCardProps> = ({
  showRedeemButton = true,
}) => {
  const { data: balanceData, isLoading } = useGetCoinBalanceQuery();
  const balance = balanceData?.data.balance ?? 0;
  const totalEarned = balanceData?.data.total_earned ?? 0;
  const totalRedeemed = balanceData?.data.total_redeemed ?? 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800/90 shadow-2xl">
      {/* Background Accent Gradients */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coin Rewards Tier: Platinum</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            {isLoading ? (
              <span className="h-10 w-48 bg-slate-800 animate-pulse rounded-lg" />
            ) : (
              <span>{formatNumber(balance)}</span>
            )}
            <span className="text-xl font-medium text-amber-400">Coins</span>
          </h2>

          <p className="text-sm text-slate-400 mt-1 max-w-md">
            Earned automatically at <strong className="text-slate-200">1 coin per ₹100 spent</strong> on successful transactions.
          </p>
        </div>

        {/* Stats Row */}
        <div className={`grid ${showRedeemButton ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} gap-4 lg:gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60`}>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Earned</span>
            <span className="text-base font-bold text-slate-200">
              {isLoading ? '...' : formatNumber(totalEarned)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Redeemed</span>
            <span className="text-base font-bold text-amber-400">
              {isLoading ? '...' : formatNumber(totalRedeemed)}
            </span>
          </div>
          {showRedeemButton && (
            <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
              <Link href="/rewards">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-amber-400/30 shadow-lg shadow-amber-500/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Redeem Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
