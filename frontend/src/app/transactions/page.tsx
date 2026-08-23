import React from 'react';
import { CustomTransactionTable } from '@/components/transactions/CustomTransactionTable';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">All Credit Card Transactions</h1>
        <p className="text-sm text-slate-400">
          Filter, search merchant names, sort by date and amount across all 10,000 records.
        </p>
      </div>

      <CustomTransactionTable />
    </div>
  );
}
