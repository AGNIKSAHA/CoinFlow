# AI Usage Transparency Log — CoinFlow

In accordance with Digital Alpha Technologies assessment guidelines, this document outlines the usage of AI assistance during the design and engineering of CoinFlow.

---

## 1. AI Tools Utilized
- **Google Antigravity Agentic Assistant (Gemini 3.6 Flash)**: Used for architecture planning, schema design, data quality audit script generation, component structuring, and automated test writing.

---

## 2. Where AI Was Used
- **Data Quality Ingestion**: Writing Python standard library inspection scripts to audit the 10,000 transaction JSON dataset.
- **SQLModel / Pydantic Schema Generation**: Drafted database models and API contract schemas.
- **Tailwind Component Scaffolding**: Generated initial JSX layout structure for custom table, modals, and Recharts containers.
- **Pytest Suite**: Drafted test cases for API endpoint responses and edge cases.

---

## 3. Real Examples of Rejected or Modified AI Output

### Example 1: Rejection of Generic `TRUNCATE` SQL String in SQLAlchemy 2.0
- **Initial AI Output**:
  ```python
  session.exec("TRUNCATE TABLE redemptions, coin_accounts, rewards, transactions RESTART IDENTITY CASCADE;")
  ```
- **Why It Was Rejected/Modified**: In SQLAlchemy 2.0 / SQLModel 0.0.39, passing raw string literals to `session.exec()` raises a runtime `sqlalchemy.exc.ArgumentError: Textual SQL expression should be explicitly declared as text(...)`.
- **Modification Applied**:
  ```python
  from sqlmodel import text
  session.exec(text("TRUNCATE TABLE redemptions, coin_accounts, rewards, transactions RESTART IDENTITY CASCADE;"))
  ```

### Example 2: Modification of Recharts Pie `onClick` Callback Signature
- **Initial AI Output**:
  ```typescript
  const handleSliceClick = (entry: { name: string }) => {
    dispatch(setCategoryFilter(entry.name));
  };
  ```
- **Why It Was Rejected/Modified**: In Recharts TypeScript definitions, the `onClick` event handler on `<Pie>` passes a `PieSectorDataItem` object where `name` can be `string | undefined`. Under strict TypeScript rules (`--noImplicitAny` and strict null checks), passing `{ name: string }` triggered compilation error `TS2769: Types of parameters 'entry' and 'data' are incompatible`.
- **Modification Applied**:
  ```typescript
  const handleSliceClick = (entry: { name?: string }) => {
    if (!entry.name) return;
    if (activeCategory === entry.name) {
      dispatch(setCategoryFilter(''));
    } else {
      dispatch(setCategoryFilter(entry.name));
    }
  };
  ```

### Example 3: Rejection of Default `HTTPException` Handler JSON Format
- **Initial AI Output**: Relying on standard FastAPI `HTTPException` detail dictionary output (`{"detail": {...}}`).
- **Why It Was Rejected/Modified**: Assessment contract requirement #34 explicitly specifies error response structure:
  ```json
  {
    "error": {
      "code": "INSUFFICIENT_BALANCE",
      "message": "Insufficient coin balance"
    }
  }
  ```
- **Modification Applied**: Implemented a custom `@app.exception_handler(HTTPException)` middleware in `app/main.py` to guarantee uniform `{ "error": { "code", "message" } }` formatting across all endpoints.
