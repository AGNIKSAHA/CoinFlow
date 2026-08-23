export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface Transaction {
  id: string;
  timestamp: string;
  merchant: string;
  category: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_method: string;
  created_at: string;
}

export type SortField = 'timestamp' | 'amount';
export type SortOrder = 'asc' | 'desc';

export interface TransactionFilterState {
  search: string;
  category: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  paymentStatus: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}
