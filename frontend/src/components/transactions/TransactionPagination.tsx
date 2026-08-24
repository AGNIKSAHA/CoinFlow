'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPage, setPageSize } from '@/store/slices/transactionUiSlice';
import { PaginationMetadata } from '@/types/api';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { formatNumber } from '@/lib/formatters';

export interface TransactionPaginationProps {
  pagination?: PaginationMetadata;
  isLoading?: boolean;
}

export const TransactionPagination: React.FC<TransactionPaginationProps> = ({ pagination, isLoading = false }) => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.transactionUi.filters);

  if (!pagination || pagination.total === 0) return null;

  const { page, page_size, total, total_pages } = pagination;
  const startItem = (page - 1) * page_size + 1;
  const endItem = Math.min(page * page_size, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-slate-400">
      {/* Count Range Indicator */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-slate-200">{formatNumber(startItem)}</strong>–
          <strong className="text-slate-200">{formatNumber(endItem)}</strong> of{' '}
          <strong className="text-slate-200">{formatNumber(total)}</strong> transactions
        </span>

        {/* Page size dropdown */}
        <div className="flex items-center gap-1.5 ml-2">
          <span>Rows per page:</span>
          <select
            value={filters.pageSize}
            disabled={isLoading}
            onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        <span className="mr-2 font-medium">
          Page {page} of {total_pages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isLoading}
          onClick={() => dispatch(setPage(1))}
          className="p-1.5 h-8 w-8"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isLoading}
          onClick={() => dispatch(setPage(page - 1))}
          className="p-1.5 h-8 w-8"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= total_pages || isLoading}
          onClick={() => dispatch(setPage(page + 1))}
          className="p-1.5 h-8 w-8"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= total_pages || isLoading}
          onClick={() => dispatch(setPage(total_pages))}
          className="p-1.5 h-8 w-8"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
