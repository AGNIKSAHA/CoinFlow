# Product & Engineering Assumptions — CoinFlow

This document documents all product choices and engineering assumptions made during the implementation of CoinFlow.

---

## 1. Single-User / Demo Context
- **Assumption**: The brief specifies an application for tracking transactions and redeeming rewards without requiring authentication.
- **Decision**: The application operates under a single demo user context (`user_id = 'default_user'`). All transaction data, coin earnings, and redemptions belong to this account.

## 2. Duplicate Transaction ID Handling
- **Dataset Finding**: The raw `transactions (2).json` contains 9,960 unique transaction IDs across 10,000 total records (40 duplicate ID occurrences).
- **Decision**: Rather than dropping duplicate records or overwriting them, duplicate IDs are suffixed during seed (`TXN2025000336_dup1`) to preserve 100% of all 10,000 transactions while satisfying PostgreSQL primary key constraints.

## 3. Timestamp Normalization
- **Dataset Finding**: Timestamps appear in 5 distinct formats: ISO 8601 UTC (`2025-10-03T21:03:27Z`), ISO with timezone offset (`2026-03-25T06:08:03+05:30`), Unix epoch in milliseconds (`1768265109000`),Slash formatted `DD/MM/YYYY HH:MM:SS`, and date-only `YYYY-MM-DD`.
- **Decision**: The seed process normalizes all formats into standard UTC datetime objects stored as `TIMESTAMP WITH TIME ZONE` in PostgreSQL. Missing time components default to midnight UTC.

## 4. Null & Missing Categories
- **Dataset Finding**: 200 records in `transactions (2).json` have `category: null`.
- **Decision**: Stored as `NULL` in the database to preserve source data fidelity. Displayed in the UI fallback as `"Uncategorized"` with a designated color token (`#94a3b8`).

## 5. Negative Amounts & Status Normalization
- **Dataset Finding**: 148 transactions have negative amounts (e.g. refunds or corrections), and status values contain mixed casing (`'success'` vs `'SUCCESS'`).
- **Decision**: Statuses are normalized to uppercase (`SUCCESS`, `FAILED`, `PENDING`). Negative amounts are preserved in the transaction ledger but earn 0 reward coins and are excluded from net spend analytics charts.

## 6. Reward Coin Calculation & Capping Rule
- **Formula**: **1 coin per ₹100 spent** on `SUCCESS` transactions with `amount > 0`.
- **Cap**: Capped at **500 coins** per individual transaction (e.g. a ₹60,000 transaction earns 500 coins).
- **Total Seeded Earned Balance**: The initial seed script computes 602,945 total earned coins across all 10,000 historical transactions.
