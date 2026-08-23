import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransactionFilterState, SortField, SortOrder, Transaction } from '@/types/transaction';
import { Reward } from '@/types/reward';

interface UiState {
  filters: TransactionFilterState;
  selectedTransaction: Transaction | null;
  isDetailsDrawerOpen: boolean;
  selectedRewardToRedeem: Reward | null;
  isRedeemModalOpen: boolean;
}

const initialFilters: TransactionFilterState = {
  search: '',
  category: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  paymentStatus: '',
  sortBy: 'timestamp',
  sortOrder: 'desc',
  page: 1,
  pageSize: 25
};

const initialState: UiState = {
  filters: initialFilters,
  selectedTransaction: null,
  isDetailsDrawerOpen: false,
  selectedRewardToRedeem: null,
  isRedeemModalOpen: false
};

export const transactionUiSlice = createSlice({
  name: 'transactionUi',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
      state.filters.page = 1;
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.filters.startDate = action.payload.startDate;
      state.filters.endDate = action.payload.endDate;
      state.filters.page = 1;
    },
    setAmountRange: (state, action: PayloadAction<{ minAmount: string; maxAmount: string }>) => {
      state.filters.minAmount = action.payload.minAmount;
      state.filters.maxAmount = action.payload.maxAmount;
      state.filters.page = 1;
    },
    setPaymentStatus: (state, action: PayloadAction<string>) => {
      state.filters.paymentStatus = action.payload;
      state.filters.page = 1;
    },
    setSort: (state, action: PayloadAction<{ sortBy: SortField; sortOrder: SortOrder }>) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },
    toggleSort: (state, action: PayloadAction<SortField>) => {
      if (state.filters.sortBy === action.payload) {
        state.filters.sortOrder = state.filters.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.filters.sortBy = action.payload;
        state.filters.sortOrder = 'desc';
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.filters.pageSize = action.payload;
      state.filters.page = 1;
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
      state.isDetailsDrawerOpen = action.payload !== null;
    },
    closeDetailsDrawer: (state) => {
      state.isDetailsDrawerOpen = false;
      state.selectedTransaction = null;
    },
    setSelectedRewardToRedeem: (state, action: PayloadAction<Reward | null>) => {
      state.selectedRewardToRedeem = action.payload;
      state.isRedeemModalOpen = action.payload !== null;
    },
    closeRedeemModal: (state) => {
      state.isRedeemModalOpen = false;
      state.selectedRewardToRedeem = null;
    }
  }
});

export const {
  setSearch,
  setCategoryFilter,
  setDateRange,
  setAmountRange,
  setPaymentStatus,
  setSort,
  toggleSort,
  setPage,
  setPageSize,
  resetFilters,
  setSelectedTransaction,
  closeDetailsDrawer,
  setSelectedRewardToRedeem,
  closeRedeemModal
} = transactionUiSlice.actions;

export default transactionUiSlice.reducer;
