'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setCategoryFilter,
  setDateRange,
  setAmountRange,
  setPaymentStatus,
  resetFilters
} from '@/store/slices/transactionUiSlice';
import { CATEGORIES, PAYMENT_STATUSES } from '@/lib/constants';
import { TransactionSearchInput } from './TransactionSearchInput';
import { Filter, RotateCcw, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const TransactionFiltersBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.transactionUi.filters);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '' ||
    filters.paymentStatus !== '';

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 mb-4 shadow-xl space-y-3">
      {/* Top row: Search + Category + Reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <TransactionSearchInput />

        {/* Category Select */}
        <div className="w-full sm:w-52">
          <select
            value={filters.category}
            onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(resetFilters())}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Second Row: Date Range + Amount Range + Payment Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60 text-xs">
        {/* Date Range */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              dispatch(setDateRange({ startDate: e.target.value, endDate: filters.endDate }))
            }
            className="bg-transparent text-slate-200 focus:outline-none w-full text-xs"
            placeholder="Start"
          />
          <span className="text-slate-500">–</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              dispatch(setDateRange({ startDate: filters.startDate, endDate: e.target.value }))
            }
            className="bg-transparent text-slate-200 focus:outline-none w-full text-xs"
          />
        </div>

        {/* Amount Range */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
          <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) =>
              dispatch(setAmountRange({ minAmount: e.target.value, maxAmount: filters.maxAmount }))
            }
            placeholder="Min ₹"
            className="bg-transparent text-slate-200 focus:outline-none w-full text-xs"
          />
          <span className="text-slate-500">–</span>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) =>
              dispatch(setAmountRange({ minAmount: filters.minAmount, maxAmount: e.target.value }))
            }
            placeholder="Max ₹"
            className="bg-transparent text-slate-200 focus:outline-none w-full text-xs"
          />
        </div>

        {/* Payment Status Pills */}
        <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-slate-400 font-medium shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {PAYMENT_STATUSES.map((statusItem) => {
            const isSelected = filters.paymentStatus === statusItem.value;
            return (
              <button
                key={statusItem.label}
                onClick={() => dispatch(setPaymentStatus(statusItem.value))}
                className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {statusItem.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
