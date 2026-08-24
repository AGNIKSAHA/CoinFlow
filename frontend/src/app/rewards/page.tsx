import React from 'react';
import { CoinBalanceCard } from '@/components/dashboard/CoinBalanceCard';
import { RewardGrid } from '@/components/rewards/RewardGrid';

export default function RewardsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">Reward Coins & Redemption Catalogue</h1>
        <p className="text-sm text-slate-400">
          Redeem your earned coins for exclusive vouchers, cashback, and experiences.
        </p>
      </div>

      <CoinBalanceCard showRedeemButton={false} />
      <RewardGrid />
    </div>
  );
}
