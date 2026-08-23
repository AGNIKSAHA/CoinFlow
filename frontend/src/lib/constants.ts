export const CATEGORIES = [
  'All Categories',
  'Education',
  'Entertainment',
  'Food & Dining',
  'Fuel',
  'Groceries',
  'Health',
  'Insurance',
  'Shopping',
  'Travel',
  'Utilities',
  'Uncategorized'
] as const;

export const PAYMENT_STATUSES = [
  { label: 'All Statuses', value: '' },
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' }
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Shopping: '#3b82f6',
  'Food & Dining': '#f97316',
  Travel: '#8b5cf6',
  Health: '#10b981',
  Entertainment: '#ec4899',
  Groceries: '#84cc16',
  Fuel: '#eab308',
  Insurance: '#06b6d4',
  Education: '#6366f1',
  Utilities: '#64748b',
  Uncategorized: '#94a3b8'
};
