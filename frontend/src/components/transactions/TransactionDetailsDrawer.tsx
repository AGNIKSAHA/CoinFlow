'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeDetailsDrawer } from '@/store/slices/transactionUiSlice';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { CATEGORY_COLORS } from '@/lib/constants';
import { CreditCard, CheckCircle2, XCircle, Clock, Gift, Hash, Calendar, Tag, Shield } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const TransactionDetailsDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.transactionUi.isDetailsDrawerOpen);
  const transaction = useAppSelector((state) => state.transactionUi.selectedTransaction);

  if (!transaction) return null;

  const isSuccess = transaction.status === 'SUCCESS';
  const isFailed = transaction.status === 'FAILED';
  const earnedCoins = isSuccess && transaction.amount > 0 ? Math.min(Math.floor(transaction.amount / 100), 500) : 0;

  const statusConfig = {
    SUCCESS: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      label: 'Payment Successful',
    },
    FAILED: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: XCircle,
      label: 'Payment Failed',
    },
    PENDING: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: Clock,
      label: 'Payment Pending',
    },
  };

  const currentStatus = statusConfig[transaction.status] || statusConfig.PENDING;
  const StatusIcon = currentStatus.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeDetailsDrawer())}
      title="Transaction Details"
      subtitle={`ID: ${transaction.id}`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Merchant & Amount Hero Header */}
        <div className="text-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">{transaction.merchant}</h2>
          <div className="text-3xl font-extrabold text-white mt-1">
            {formatCurrency(transaction.amount, transaction.currency)}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-3 ${currentStatus.bg}">
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentStatus.label}</span>
          </div>
        </div>

        {/* Coins Earned Banner */}
        {isSuccess && earnedCoins > 0 && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-xl text-amber-300">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Rewards Earned</p>
              <p className="text-sm font-bold text-white">
                +{earnedCoins} CoinFlow Reward Coins <span className="text-xs font-normal text-amber-300/80">(₹100 = 1 coin)</span>
              </p>
            </div>
          </div>
        )}

        {/* Detail Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1 mb-1 font-medium">
              <Tag className="w-3.5 h-3.5 text-blue-400" /> Category
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {transaction.category || 'Uncategorized'}
            </span>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1 mb-1 font-medium">
              <Shield className="w-3.5 h-3.5 text-purple-400" /> Payment Method
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {transaction.payment_method}
            </span>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 col-span-2 sm:col-span-1">
            <span className="text-slate-400 flex items-center gap-1 mb-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Timestamp
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {formatDateTime(transaction.timestamp)}
            </span>
          </div>

          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 col-span-2 sm:col-span-1">
            <span className="text-slate-400 flex items-center gap-1 mb-1 font-medium">
              <Hash className="w-3.5 h-3.5 text-amber-400" /> Transaction ID
            </span>
            <span className="text-xs font-mono font-semibold text-slate-300 break-all">
              {transaction.id}
            </span>
          </div>
        </div>

        {/* Modal Close Action */}
        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={() => dispatch(closeDetailsDrawer())} className="w-full">
            Close Details
          </Button>
        </div>
      </div>
    </Modal>
  );
};
