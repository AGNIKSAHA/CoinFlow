import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TransactionFilterState, Transaction } from '@/types/transaction';
import { Reward, CoinBalance, RedeemRewardRequest, RedeemRewardResponse } from '@/types/reward';
import { CategorySpendResponse, MonthlySpendResponse } from '@/types/analytics';
import { PaginatedApiResponse, ApiResponse } from '@/types/api';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Transactions', 'Rewards', 'CoinBalance', 'Analytics'],
  endpoints: (builder) => ({
    getTransactions: builder.query<PaginatedApiResponse<Transaction>, TransactionFilterState>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.startDate) params.append('start_date', filters.startDate);
        if (filters.endDate) params.append('end_date', filters.endDate);
        if (filters.minAmount) params.append('min_amount', filters.minAmount);
        if (filters.maxAmount) params.append('max_amount', filters.maxAmount);
        if (filters.paymentStatus) params.append('payment_status', filters.paymentStatus);
        if (filters.sortBy) params.append('sort_by', filters.sortBy);
        if (filters.sortOrder) params.append('sort_order', filters.sortOrder);
        params.append('page', filters.page.toString());
        params.append('page_size', filters.pageSize.toString());

        return `/transactions?${params.toString()}`;
      },
      providesTags: ['Transactions']
    }),

    getTransactionDetail: builder.query<ApiResponse<Transaction>, string>({
      query: (id) => `/transactions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Transactions', id }]
    }),

    getCategoryAnalytics: builder.query<ApiResponse<CategorySpendResponse>, void>({
      query: () => '/analytics/category',
      providesTags: ['Analytics']
    }),

    getMonthlyAnalytics: builder.query<ApiResponse<MonthlySpendResponse>, void>({
      query: () => '/analytics/monthly',
      providesTags: ['Analytics']
    }),

    getRewards: builder.query<ApiResponse<Reward[]>, void>({
      query: () => '/rewards',
      providesTags: ['Rewards']
    }),

    getCoinBalance: builder.query<ApiResponse<CoinBalance>, void>({
      query: () => '/rewards/balance',
      providesTags: ['CoinBalance']
    }),

    redeemReward: builder.mutation<ApiResponse<RedeemRewardResponse>, RedeemRewardRequest>({
      query: (body) => ({
        url: '/rewards/redeem',
        method: 'POST',
        body
      }),
      invalidatesTags: ['CoinBalance']
    })
  })
});

export const {
  useGetTransactionsQuery,
  useGetTransactionDetailQuery,
  useGetCategoryAnalyticsQuery,
  useGetMonthlyAnalyticsQuery,
  useGetRewardsQuery,
  useGetCoinBalanceQuery,
  useRedeemRewardMutation
} = api;
