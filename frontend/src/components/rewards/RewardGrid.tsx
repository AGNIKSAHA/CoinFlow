'use client';

import React from 'react';
import { useGetRewardsQuery, useGetCoinBalanceQuery } from '@/store/api/api';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedRewardToRedeem } from '@/store/slices/transactionUiSlice';
import { RewardCard } from './RewardCard';
import { RedeemConfirmationModal } from './RedeemConfirmationModal';
import { Loader } from '@/components/common/Loader';
import { ErrorState } from '@/components/common/ErrorState';
import { Gift } from 'lucide-react';

export const RewardGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: rewardsData, isLoading, isError, refetch } = useGetRewardsQuery();
  const { data: balanceData } = useGetCoinBalanceQuery();

  const userBalance = balanceData?.data.balance ?? 0;

  if (isLoading) return <Loader text="Loading reward catalogue..." />;
  if (isError || !rewardsData)
    return <ErrorState title="Failed to load rewards" onRetry={refetch} />;

  const rewards = rewardsData.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-amber-400" />
        <h2 className="text-xl font-bold text-slate-100">Reward Catalogue</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            userBalance={userBalance}
            onRedeemSelect={(r) => dispatch(setSelectedRewardToRedeem(r))}
          />
        ))}
      </div>

      <RedeemConfirmationModal />
    </div>
  );
};
