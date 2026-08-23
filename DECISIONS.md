# Technical Architecture & Architectural Decisions — CoinFlow

This document outlines the technical rationale behind key architectural choices made during the development of CoinFlow.

---

## 1. Next.js App Router & Component Boundaries
- **Rationale**: Next.js App Router provides optimal performance through Server Components.
- **Implementation**: The main page layout and header structure are server-rendered. `"use client"` is strictly reserved for interactive boundaries such as Redux state providers, custom table controls, chart interactions, and modals.

## 2. Redux Toolkit + RTK Query (No TanStack Query / Zustand / Axios)
- **Rationale**: RTK Query provides automatic server-state caching, typed API hooks, normalized cache invalidation, and seamless integration with Redux Toolkit UI state slices.
- **Benefit**: Redux manages local UI state (filters, sorting, active modals) while RTK Query handles server state (`Transactions`, `CoinBalance`, `Rewards`), automatically refetching and updating balance upon reward redemption.

## 3. Hand-Built Custom Table (No MUI / Ant Design / shadcn / Chakra)
- **Rationale**: Fulfills the core constraint of building a custom table without external UI component libraries to demonstrate pure CSS/Tailwind craft, sticky header layout, focus states, and mobile responsiveness.
- **Benefit**: Lightweight, zero library bloat, and tailored specifically for 10,000+ record server-side pagination performance.

## 4. Server-Side Pagination & Query Composition over Client Virtualization
- **Rationale**: For a dataset of 10,000 transactions, shipping all 10k rows to client memory increases initial payload size and degrades mobile performance.
- **Implementation**: All filtering (`category`, `date_range`, `amount_range`, `payment_status`), debounced merchant search (`ILIKE`), sorting (`timestamp`, `amount`), and pagination (`page`, `page_size`) occur at the PostgreSQL query level using index-optimized queries (`INDEX` on timestamp, merchant, category, status, amount).

## 5. PostgreSQL 18 Relational Schema over JSON Column Ingestion
- **Rationale**: Storing transactions as a single JSONB blob prevents effective indexing and fast analytical aggregation.
- **Implementation**: Structured relational schema with SQLModel/SQLAlchemy 2.0 and Alembic version control. Money is represented precisely as `NUMERIC(14,2)` to prevent floating-point rounding errors.

## 6. Atomic Redemption Transactions in FastAPI
- **Rationale**: Reward redemption must prevent race conditions and negative coin balances.
- **Implementation**: `RewardService.redeem_reward()` executes balance verification, coin deduction, and redemption log creation inside an atomic database transaction. If any validation fails (insufficient coins or inactive reward), the session rolls back cleanly and returns a structured JSON error response.
