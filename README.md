# CoinFlow — Credit Card Rewards & Spending Dashboard

**CoinFlow** is a production-grade full-stack financial dashboard for credit card bill payments, spending analytics, and reward coin redemptions. It handles a dataset of **10,000 credit card transactions** using a **Next.js App Router** frontend, a **FastAPI** Python backend, and a **PostgreSQL 18** database.

---

## Technical Stack

- **Frontend**: Next.js (App Router), React, TypeScript (Strict Mode, 0 `any`), Tailwind CSS, Redux Toolkit, RTK Query, Recharts, Lucide React, React Hook Form, Yup.
- **Backend**: Python 3.13, FastAPI, SQLModel / SQLAlchemy 2.0, PostgreSQL 18, Alembic, Uvicorn, Pydantic v2.
- **Architecture**:
  - Custom hand-built transaction table (**built without external table UI component libraries**) supporting sticky headers, column sorting, debounced merchant search, combinable filters, and server-side pagination.
  - Hand-built accessible Modal system with focus trap, `Escape` key listener, and `aria-modal` attributes.
  - Interactive Recharts category spend chart with click-to-filter synchronization to the transaction table.
  - Atomic reward redemption flow in PostgreSQL with database transaction safety and rollback protection.

---

## Repository Structure

```text
CoinFlow/
├── backend/
│   ├── alembic/              # Alembic migration scripts
│   ├── app/
│   │   ├── core/             # DB connection, config settings, security/rate-limit middleware
│   │   ├── models/           # SQLModel database models (Transaction, CoinAccount, Reward, Redemption)
│   │   ├── schemas/          # Pydantic request & response contract schemas
│   │   ├── repositories/     # Data access layer with filter composition & indexed sorting
│   │   ├── services/         # Business logic & atomic redemption transactions
│   │   └── routes/           # FastAPI router handlers
│   ├── scripts/
│   │   └── seed.py           # Ingestion script for 10,000 transaction dataset & rewards catalogue
│   ├── tests/                # Pytest automated test suite
│   ├── init_db.py            # Automatic PostgreSQL database initializer
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router pages (/, /transactions, /rewards)
│   │   ├── components/       # Custom hand-built Table, Modal, Drawer, Charts, Filters, Rewards
│   │   ├── store/            # Redux Toolkit store & RTK Query API slice
│   │   ├── types/            # Strict TypeScript API contract interfaces
│   │   ├── lib/              # Design tokens, constants, and formatters
│   │   └── providers/        # Redux StoreProvider wrapper
│   ├── package.json
│   └── .env.local
│
├── README.md
├── ASSUMPTIONS.md
├── DECISIONS.md
├── AI-USAGE.md
└── .gitignore
```

---

## Local Setup (< 5 Minutes)

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL 16+ (or PostgreSQL 18 local service)

### 1. PostgreSQL Database Initialization
Ensure PostgreSQL is running locally on port `5432`.

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt

# Run database initializer (creates database coinflow_db automatically if not present)
python init_db.py

# Run Alembic Database Migrations
python -m alembic upgrade head

# Run Data Seed Script (ingests 10,000 transactions & initializes rewards + coins)
python -m scripts.seed

# Run Pytest suite
python -m pytest

# Start FastAPI Uvicorn Server
python -m uvicorn app.main:app --port 8000 --reload
```
The FastAPI backend will run on `http://localhost:8000`. Swagger API docs are available at `http://localhost:8000/docs`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run build
npm run dev
```
The Next.js dashboard will run on `http://localhost:3000`.

---

## Features Completed

- [x] **10,000 Transaction Processing**: Normalized 100% of multi-format ISO/Unix timestamps, handled float/string amounts, negative values, and deduplicated IDs.
- [x] **PostgreSQL 18 Relational Schema**: Indexed tables for transactions, rewards, coin accounts, and redemptions.
- [x] **Custom Hand-Built Transaction Table**: Built entirely without component libraries. Features sticky headers, date/amount sorting, debounced merchant search, combinable multi-filters, and row click details drawer.
- [x] **Server-Side Pagination & Filtering**: Filter queries executed in PostgreSQL using index-optimized queries rather than browser memory.
- [x] **Spend Analytics**: Interactive Recharts category spend breakdown and monthly trend over time.
- [x] **Chart-to-Table Cross Filtering**: Clicking a category chart slice filters the transaction table in real time.
- [x] **Reward Coin Earning System**: 1 coin earned per ₹100 spent on successful transactions (capped at 500 coins per transaction).
- [x] **Atomic Reward Redemption**: PostgreSQL transaction safety for coin deductions with clean failure recovery.
- [x] **Accessibility & Craft**: Hand-built accessible modal with focus trap, `Escape` key listener, ARIA roles, and responsive layout down to 360px mobile viewports.

---

## Known Issues / Non-Goals
- **Authentication**: Intentionally omitted per assessment guidelines (single-user demo context).
- **Two-way chart reshaping**: Chart data currently reflects the total dataset aggregations, while table filters update the transaction ledger.
