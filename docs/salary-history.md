# Salary History Feature

HR can query what an employee's salary was on any given date, including past dates.

## Endpoint

```
GET /api/employees/:id/salary?date=YYYY-MM-DD
```

### Response

```json
{
  "id": "...",
  "employee_id": "abc-123",
  "salary": 80000,
  "currency": "USD",
  "effective_date": "2024-01-15T00:00:00.000Z",
  "created_at": "..."
}
```

### Error responses

| Status | Reason |
|---|---|
| 400 | `date` query param missing or not a valid date string |
| 404 | No salary record exists on or before the given date |

---

## Architecture

- New `SalaryHistory` table with a composite index on `(employee_id, effective_date)` for fast date-range lookups
- `onDelete: Cascade` — salary history is automatically cleaned up when an employee is deleted
- Snapshot is recorded automatically on employee `create` (using `hire_date`) and on `update` when salary changes
- Follows existing patterns: interface → in-memory repo (tests) + Prisma repo (prod), injected via constructor

### New files

```
src/salary-history/
  repository/
    salary-history.repository.interface.ts
    in-memory-salary-history.repository.ts
    in-memory-salary-history.repository.test.ts
    prisma-salary-history.repository.ts
    prisma-salary-history.repository.test.ts
  salary-history.schemas.ts
  salary-history.service.ts
  salary-history.service.test.ts
  salary-history.router.ts
  salary-history.router.test.ts
src/shared/
  types/salary-history.types.ts
  errors/not-found.error.ts
```

---

## How to test

### Error cases

```bash
# Missing date → 422
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary"

# Invalid date → 422
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=not-a-date"

# No salary record before given date → 404
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=1990-01-01"
```

### Happy path

```bash
# 1. Create employee — salary snapshot recorded automatically
curl -X POST https://salary-management-production-9819.up.railway.app/api/employees \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Alice","job_title":"Engineer","country":"India","salary":80000}'
# note the id from the response

# 2. Query salary today → 80000
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=2026-06-10"

# 3. Give Alice a raise
curl -X PUT https://salary-management-production-9819.up.railway.app/api/employees/<id> \
  -H "Content-Type: application/json" \
  -d '{"salary":95000}'

# 4. Query before the raise → still 80000
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=2026-06-09"

# 5. Query today → 95000
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=2026-06-10"
```

---

## Deployment

Migration is applied automatically on Railway startup via `npx prisma migrate deploy` in `start.sh`. No manual steps needed.

## Backfilling existing employees

Employees that existed before this feature was deployed have no salary history records — querying them returns 404. Run the backfill script once after deployment to seed a historical record for every existing employee.

The script is **idempotent** — it only targets employees with no salary history and is safe to run multiple times.

### Run locally

```bash
cd backend
npm run backfill:salary-history
```

### Run on Railway (one-off)

Railway runs the production Docker image which has no `ts-node` — use the compiled output:

```bash
railway run npm run backfill:salary-history:prod
```

> This requires the app to have been built and deployed first (`dist/seed/backfill-salary-history.js` must exist).

### What it does

- Finds all employees with no `SalaryHistory` records
- Creates one snapshot per employee using their current `salary`, `currency`, and `hire_date` as `effective_date`
- Processes in batches of 500 to handle large datasets efficiently
- Logs progress and skips automatically if all employees are already backfilled
