'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useGetTransactionsQuery } from '@/store/api/api';
import { toggleSort, setSelectedTransaction, resetFilters } from '@/store/slices/transactionUiSlice';
import { SortField, Transaction } from '@/types/transaction';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { CATEGORY_COLORS } from '@/lib/constants';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { TransactionPagination } from './TransactionPagination';
import { TransactionFiltersBar } from './TransactionFiltersBar';
import { TransactionDetailsDrawer } from './TransactionDetailsDrawer';

export const CustomTransactionTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.transactionUi.filters);

  const { data: response, isLoading, isFetching, isError, refetch } = useGetTransactionsQuery(filters);

  const handleSortClick = (field: SortField) => {
    dispatch(toggleSort(field));
  };

  const handleRowClick = (transaction: Transaction) => {
    dispatch(setSelectedTransaction(transaction));
  };

  const getSortIcon = (field: SortField) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />;
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Success
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 animate-spin" /> Pending
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  const transactions = response?.data || [];
  const pagination = response?.pagination;

  return (
    <div className="space-y-4">
      {/* Combinable Filters & Search Bar */}
      <TransactionFiltersBar />

      <Card className="p-0 overflow-hidden border-slate-800/90 shadow-2xl">
        {/* Table Container */}
        <div className="relative w-full overflow-x-auto max-h-[620px] scrollbar-thin scrollbar-thumb-slate-800">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Merchant</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th
                  onClick={() => handleSortClick('timestamp')}
                  className="py-3.5 px-4 font-semibold cursor-pointer select-none group hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date & Time</span>
                    {getSortIcon('timestamp')}
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Payment Method</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th
                  onClick={() => handleSortClick('amount')}
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer select-none group hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount</span>
                    {getSortIcon('amount')}
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold w-10"></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {isLoading && (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-32" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-28" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-800 rounded w-16" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-800 rounded w-20 ml-auto" /></td>
                    <td className="py-4 px-4" />
                  </tr>
                ))
              )}

              {!isLoading && isError && (
                <tr>
                  <td colSpan={7} className="p-8">
                    <ErrorState title="Failed to load transactions" onRetry={refetch} />
                  </td>
                </tr>
              )}

              {!isLoading && !isError && transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8">
                    <EmptyState onAction={() => dispatch(resetFilters())} />
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                transactions.map((txn) => {
                  const catColor = CATEGORY_COLORS[txn.category || 'Uncategorized'] || '#94a3b8';
                  return (
                    <tr
                      key={txn.id}
                      onClick={() => handleRowClick(txn)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(txn);
                        }
                      }}
                      className="hover:bg-slate-800/60 focus:bg-slate-800/80 focus:outline-none transition-colors cursor-pointer group"
                    >
                      {/* Merchant */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                          {txn.merchant}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono sm:hidden">{txn.id}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: catColor }}
                          />
                          {txn.category || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                        {formatDateTime(txn.timestamp)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-xs text-slate-400 font-medium">
                        {txn.payment_method}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(txn.status)}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100 whitespace-nowrap">
                        <span className={txn.amount < 0 ? 'text-rose-400' : 'text-slate-100'}>
                          {formatCurrency(txn.amount, txn.currency)}
                        </span>
                      </td>

                      {/* Arrow indicator */}
                      <td className="py-3.5 px-4 text-slate-600 group-hover:text-slate-300 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <TransactionPagination pagination={pagination} />
      </Card>

      {/* Transaction Details Modal/Drawer */}
      <TransactionDetailsDrawer />
    </div>
  );
};
