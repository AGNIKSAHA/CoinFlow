export interface CategorySpendItem {
  category: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface CategorySpendResponse {
  items: CategorySpendItem[];
  total_spend: number;
}

export interface MonthlySpendItem {
  month: string; // YYYY-MM
  month_label: string; // e.g. "Jan 2026"
  total_amount: number;
  transaction_count: number;
}

export interface MonthlySpendResponse {
  items: MonthlySpendItem[];
  total_spend: number;
}
