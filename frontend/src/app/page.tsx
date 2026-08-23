import React from 'react';
import { CoinBalanceCard } from '@/components/dashboard/CoinBalanceCard';
import { CategorySpendChart } from '@/components/analytics/CategorySpendChart';
import { MonthlySpendChart } from '@/components/analytics/MonthlySpendChart';
import { CustomTransactionTable } from '@/components/transactions/CustomTransactionTable';
import { RewardGrid } from '@/components/rewards/RewardGrid';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 1. Coin Balance Hero Header */}
      <CoinBalanceCard />

      {/* 2. Spend Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategorySpendChart />
        <MonthlySpendChart />
      </section>

      {/* 3. Transaction Dashboard Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Transactions Ledger</h2>
            <p className="text-xs text-slate-400">Search 10,000+ credit card transactions with combinable filters</p>
          </div>
        </div>
        <CustomTransactionTable />
      </section>

      {/* 4. Rewards Catalogue */}
      <section className="pt-4">
        <RewardGrid />
      </section>
    </div>
  );
}
