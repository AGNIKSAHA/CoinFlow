'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeRedeemModal } from '@/store/slices/transactionUiSlice';
import { useRedeemRewardMutation, useGetCoinBalanceQuery } from '@/store/api/api';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatNumber } from '@/lib/formatters';
import { Gift, Coins, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const redeemSchema = yup.object({
  confirmCheck: yup
    .boolean()
    .oneOf([true], 'You must confirm redemption to proceed')
    .required()
});

type RedeemFormData = yup.InferType<typeof redeemSchema>;

export const RedeemConfirmationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.transactionUi.isRedeemModalOpen);
  const reward = useAppSelector((state) => state.transactionUi.selectedRewardToRedeem);

  const { data: balanceData } = useGetCoinBalanceQuery();
  const currentBalance = balanceData?.data.balance ?? 0;

  const [redeemMutation, { isLoading }] = useRedeemRewardMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RedeemFormData>({
    resolver: yupResolver(redeemSchema),
    defaultValues: { confirmCheck: true }
  });

  if (!reward) return null;

  const handleClose = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    reset();
    dispatch(closeRedeemModal());
  };

  const onSubmit = async (_data: RedeemFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await redeemMutation({ reward_id: reward.id }).unwrap();
      setSuccessMessage(res.message || `Successfully redeemed '${reward.name}'!`);
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: { message?: string } } };
      const msg = apiErr?.data?.error?.message || 'Redemption failed. Please try again.';
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={successMessage ? 'Redemption Successful!' : 'Confirm Reward Redemption'}
      subtitle={reward.name}
      maxWidth="md"
    >
      {/* Success View */}
      {successMessage ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Reward Claimed!</h3>
          <p className="text-sm text-slate-300 max-w-xs mx-auto">{successMessage}</p>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
            Your remaining coin balance is updated instantly. Check your email for redemption instructions.
          </div>

          <Button variant="primary" onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        /* Confirmation Form View */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Balance:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {formatNumber(currentBalance)} coins
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Reward Cost:</span>
              <span className="font-bold text-rose-400">- {formatNumber(reward.coin_cost)} coins</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-200">Balance After Redemption:</span>
              <span className="text-emerald-400 font-bold">
                {formatNumber(currentBalance - reward.coin_cost)} coins
              </span>
            </div>
          </div>

          {/* Error Banner if API fails */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="space-y-1">
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('confirmCheck')}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>I confirm that I want to redeem this reward for {reward.coin_cost} coins.</span>
            </label>
            {errors.confirmCheck && (
              <p className="text-[11px] text-rose-400">{errors.confirmCheck.message}</p>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-amber-400/30"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Confirm & Redeem
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
