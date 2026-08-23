'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useGetMonthlyAnalyticsQuery } from '@/store/api/api';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { ErrorState } from '@/components/common/ErrorState';
import { TrendingUp } from 'lucide-react';

export const MonthlySpendChart: React.FC = () => {
  const { data: analyticsData, isLoading, isError, refetch } = useGetMonthlyAnalyticsQuery();

  if (isLoading) return <Card><Loader text="Loading monthly trend..." /></Card>;
  if (isError || !analyticsData)
    return <Card><ErrorState title="Trend Error" onRetry={refetch} /></Card>;

  const data = analyticsData.data.items.map((item) => ({
    month: item.month_label,
    amount: Number(item.total_amount),
    count: item.transaction_count
  }));

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Monthly Spending Trend</h3>
          <p className="text-xs text-slate-400">Total spending history aggregated by month</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs">
                      <p className="font-bold text-slate-100 mb-1">{label}</p>
                      <p className="text-blue-400 font-semibold">
                        Total Spent: {formatCurrency(item.amount)}
                      </p>
                      <p className="text-slate-400">Transactions: {formatNumber(item.count)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
