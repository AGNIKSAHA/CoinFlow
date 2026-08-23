'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearch } from '@/store/slices/transactionUiSlice';

export const TransactionSearchInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const reduxSearch = useAppSelector((state) => state.transactionUi.filters.search);
  const [localSearch, setLocalSearch] = useState(reduxSearch);

  // Keep local search synced with Redux if reset externally
  useEffect(() => {
    setLocalSearch(reduxSearch);
  }, [reduxSearch]);

  // Debounce search update to Redux
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== reduxSearch) {
        dispatch(setSearch(localSearch));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, reduxSearch, dispatch]);

  return (
    <div className="relative flex-1 min-w-[220px]">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search merchant name..."
        className="w-full pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
      />
      {localSearch && (
        <button
          onClick={() => setLocalSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
