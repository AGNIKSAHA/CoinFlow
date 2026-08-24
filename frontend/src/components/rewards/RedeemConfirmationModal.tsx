'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeRedeemModal } from '@/store/slices/transactionUiSlice';
import { useRedeemRewardMutation, useGetCoinBalanceQuery } from '@/store/api/api';
import { RedeemRewardResponse } from '@/types/reward';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatNumber } from '@/lib/formatters';
import { Coins, CheckCircle2, AlertTriangle, ArrowRight, Minus, Plus } from 'lucide-react';
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

  const [quantity, setQuantity] = useState<number>(1);
  const [redeemMutation, { isLoading }] = useRedeemRewardMutation();
  const [successData, setSuccessData] = useState<RedeemRewardResponse | null>(null);
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

  // Reset quantity when modal opens for a reward
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSuccessData(null);
      setErrorMessage(null);
      reset({ confirmCheck: true });
    }
  }, [isOpen, reward?.id, reset]);

  if (!reward) return null;

  const maxQuantity = Math.max(1, Math.floor(currentBalance / reward.coin_cost));
  const totalCost = reward.coin_cost * quantity;
  const balanceAfter = currentBalance - totalCost;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
    } else {
      setQuantity(Math.max(1, Math.min(maxQuantity, val)));
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setErrorMessage(null);
    setQuantity(1);
    reset();
    dispatch(closeRedeemModal());
  };

  const onSubmit = async (_data: RedeemFormData) => {
    setErrorMessage(null);
    setSuccessData(null);

    try {
      const res = await redeemMutation({
        reward_id: reward.id,
        quantity: quantity
      }).unwrap();
      setSuccessData(res.data);
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
      title={successData ? 'Redemption Successful!' : 'Confirm Reward Redemption'}
      subtitle={reward.name}
      maxWidth="md"
    >
      {/* Success View */}
      {successData ? (
        <div className="text-center py-5 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Redemption Successful!</h3>
            <p className="text-sm font-semibold text-blue-400 mt-1">{reward.name}</p>
            <p className="text-xs text-slate-300 mt-1">
              {successData.quantity} voucher{successData.quantity > 1 ? 's' : ''} redeemed successfully.
            </p>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Coins Used:</span>
              <span className="font-bold text-amber-400">{formatNumber(successData.total_cost)} coins</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-800/80">
              <span>Remaining Balance:</span>
              <span className="font-bold text-emerald-400">{formatNumber(successData.remaining_balance)} coins</span>
            </div>
          </div>

          <Button variant="primary" onClick={handleClose} className="w-full font-bold">
            Done
          </Button>
        </div>
      ) : (
        /* Confirmation Form View */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Quantity Selector Section */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Quantity</span>
                <span className="text-[11px] text-slate-400">Maximum available: {maxQuantity}</span>
              </div>

              {/* Quantity Counter Control */}
              <div className="flex items-center border border-slate-700 bg-slate-900 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isLoading}
                  className="px-3 py-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityInputChange}
                  min={1}
                  max={maxQuantity}
                  disabled={isLoading}
                  className="w-12 text-center bg-transparent text-sm font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= maxQuantity || isLoading}
                  className="px-3 py-1.5 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Current Balance:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> {formatNumber(currentBalance)} coins
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Unit Cost:</span>
                <span className="font-medium text-slate-300">{formatNumber(reward.coin_cost)} coins</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Cost:</span>
                <span className="font-bold text-rose-400">- {formatNumber(totalCost)} coins</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-200">Balance After Redemption:</span>
                <span className={balanceAfter >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {formatNumber(balanceAfter)} coins
                </span>
              </div>
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
                disabled={isLoading}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>
                I confirm that I want to redeem {quantity} {quantity > 1 ? 'vouchers' : 'voucher'}.
              </span>
            </label>
            {errors.confirmCheck && (
              <p className="text-[11px] text-rose-400">{errors.confirmCheck.message}</p>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || totalCost > currentBalance}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-amber-400/30"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Confirm & Redeem — {formatNumber(totalCost)} coins
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
