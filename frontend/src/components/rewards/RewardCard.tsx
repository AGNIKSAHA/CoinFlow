'use client';

import React from 'react';
import { Reward } from '@/types/reward';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Coins, Tag, Gift, CheckCircle2 } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';

export interface RewardCardProps {
  reward: Reward;
  userBalance: number;
  onRedeemSelect: (reward: Reward) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userBalance,
  onRedeemSelect,
}) => {
  const isRedeemed = !!reward.is_redeemed;
  const canAfford = !isRedeemed && userBalance >= reward.coin_cost;

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full bg-slate-900/90 border-slate-800/80">
      <div>
        {/* Category & Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Tag className="w-3 h-3" /> {reward.category}
          </span>

          {isRedeemed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Redeemed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> {formatNumber(reward.coin_cost)} coins
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-100 mb-1.5 line-clamp-1">{reward.name}</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">{reward.description}</p>
      </div>

      {/* Redeem Action Button */}
      <div className="pt-3 border-t border-slate-800/60">
        <Button
          variant={isRedeemed ? 'ghost' : canAfford ? 'primary' : 'outline'}
          size="sm"
          disabled={isRedeemed || !canAfford}
          onClick={() => onRedeemSelect(reward)}
          leftIcon={isRedeemed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Gift className="w-4 h-4" />}
          className="w-full font-semibold"
        >
          {isRedeemed
            ? 'Redeemed ✓'
            : canAfford
            ? 'Redeem Voucher'
            : `Need ${formatNumber(reward.coin_cost - userBalance)} more coins`}
        </Button>
      </div>
    </Card>
  );
};
