'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useGetCategoryAnalyticsQuery } from '@/store/api/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCategoryFilter } from '@/store/slices/transactionUiSlice';
import { CATEGORY_COLORS } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { ErrorState } from '@/components/common/ErrorState';
import { PieChart as PieIcon, Filter, X } from 'lucide-react';

export const CategorySpendChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeCategory = useAppSelector((state) => state.transactionUi.filters.category);
  const { data: analyticsData, isLoading, isError, refetch } = useGetCategoryAnalyticsQuery();

  if (isLoading) return <Card><Loader text="Loading category analytics..." /></Card>;
  if (isError || !analyticsData)
    return <Card><ErrorState title="Analytics Error" onRetry={refetch} /></Card>;

  const items = analyticsData.data.items.map((item) => ({
    name: item.category,
    value: Number(item.total_amount),
    count: item.transaction_count,
    percentage: item.percentage,
    color: CATEGORY_COLORS[item.category] || '#94a3b8'
  }));

  const handleSliceClick = (entry: { name?: string }) => {
    if (!entry.name) return;
    if (activeCategory === entry.name) {
      dispatch(setCategoryFilter(''));
    } else {
      dispatch(setCategoryFilter(entry.name));
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Spend by Category</h3>
            <p className="text-xs text-slate-400">Click a category slice to filter transaction table</p>
          </div>
        </div>

        {activeCategory && (
          <button
            onClick={() => dispatch(setCategoryFilter(''))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-600/30 transition-colors cursor-pointer"
          >
            <Filter className="w-3 h-3" />
            <span>{activeCategory}</span>
            <X className="w-3 h-3 ml-0.5" />
          </button>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              onClick={handleSliceClick}
              className="cursor-pointer focus:outline-none"
            >
              {items.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={activeCategory === entry.name ? '#ffffff' : 'transparent'}
                  strokeWidth={activeCategory === entry.name ? 3 : 0}
                  opacity={activeCategory && activeCategory !== entry.name ? 0.45 : 1}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs">
                      <p className="font-bold text-slate-100 flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: data.color }}
                        />
                        {data.name}
                      </p>
                      <p className="text-slate-300">Amount: <strong>{formatCurrency(data.value)}</strong></p>
                      <p className="text-slate-400">Share: {data.percentage}% ({formatNumber(data.count)} txns)</p>
                      <p className="text-[10px] text-blue-400 mt-1 font-medium">Click to filter table</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Legend Pills */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/80">
        {items.map((cat) => {
          const isSelected = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => handleSliceClick(cat)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-800 text-white border-slate-600 ring-2 ring-blue-500/50'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
