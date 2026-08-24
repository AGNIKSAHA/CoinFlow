'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeRedeemModal } from '@/store/slices/transactionUiSlice';
import { useRedeemRewardMutation, useGetCoinBalanceQuery } from '@/store/api/api';
import { RedeemRewardResponse } from '@/types/reward';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatNumber } from '@/lib/formatters';
import { Coins, CheckCircle2, AlertTriangle, ArrowRight, Minus, Plus, Zap } from 'lucide-react';
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

  const [inputValue, setInputValue] = useState('1');
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

  const maxQuantity = reward ? Math.max(1, Math.floor(currentBalance / reward.coin_cost)) : 1;

  // Derive the numeric quantity from the string — allows 0
  const getQuantity = (): number => {
    const n = parseInt(inputValue, 10);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const quantity = getQuantity();

  // Reset when modal opens or reward changes
  useEffect(() => {
    if (isOpen) {
      setInputValue('1');
      setSuccessData(null);
      setErrorMessage(null);
      reset({ confirmCheck: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reward?.id]);

  if (!reward) return null;

  const totalCost = reward.coin_cost * quantity;
  const balanceAfter = currentBalance - totalCost;
  const isExceedingMax = quantity > maxQuantity;

  const handleDecrease = () => {
    setInputValue(String(Math.max(0, quantity - 1)));
  };

  const handleIncrease = () => {
    setInputValue(String(Math.min(maxQuantity, quantity + 1)));
  };

  // Let the user type freely — no clamping, no filtering during typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // On blur: clamp and normalize
  const handleInputBlur = () => {
    const n = parseInt(inputValue, 10);
    if (isNaN(n) || n < 0) {
      setInputValue('1');
    } else if (n > maxQuantity) {
      setInputValue(String(maxQuantity));
    } else {
      setInputValue(String(n)); // normalize (strip leading zeros etc.)
    }
  };

  const handleClose = () => {
    setSuccessData(null);
    setErrorMessage(null);
    setInputValue('1');
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
          {/* Main Quantity Selector Container */}
          <div className="p-4.5 bg-slate-950/90 rounded-2xl border border-slate-800/90 space-y-4">

            {/* Header & Stepper Control */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Select Quantity</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  Max available: <strong className="text-slate-300 font-semibold">{formatNumber(maxQuantity)}</strong>
                </span>
              </div>

              {/* Stepper Inputs: native <button> + <input type="text" inputMode="numeric"> */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isLoading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  disabled={isLoading}
                  placeholder="—"
                  aria-label="Reward quantity"
                  className="w-16 sm:w-20 px-1 text-center bg-slate-950/70 border border-slate-800 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 rounded-lg py-1.5 text-sm font-extrabold text-white placeholder:text-slate-600 placeholder:font-normal transition-all outline-none cursor-text"
                />

                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= maxQuantity || isLoading}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shrink-0"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cost Breakdown Details */}
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
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-200">Balance After Redemption:</span>
                <span className={!isExceedingMax && balanceAfter >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {formatNumber(balanceAfter)} coins
                </span>
              </div>
            </div>
          </div>

          {/* Warning banner if quantity exceeds max limit */}
          {isExceedingMax && (
            <div className="flex items-center gap-2 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Quantity exceeds maximum available balance limit ({formatNumber(maxQuantity)} vouchers).</span>
            </div>
          )}

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
                disabled={isLoading || isExceedingMax}
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
          <div className="flex items-stretch gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-11 text-xs sm:text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || isExceedingMax || totalCost > currentBalance || quantity < 1}
              className="flex-1 h-11 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold border-blue-500/30 disabled:opacity-40 disabled:hover:bg-blue-600"
              rightIcon={<Zap className="w-4 h-4 shrink-0" />}
            >
              Confirm & Redeem — {formatNumber(totalCost)} coins
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
