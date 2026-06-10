# Salary History — Testing Guide

## What was verified in production (`salary-management-production-9819.up.railway.app`)

### Validation — confirmed working

```bash
# Missing date → 422
curl "https://salary-management-production-9819.up.railway.app/api/employees/000959f7-daac-4123-b8e1-37ca69813ab0/salary"
# → 422

# Invalid date string → 422
curl "https://salary-management-production-9819.up.railway.app/api/employees/000959f7-daac-4123-b8e1-37ca69813ab0/salary?date=not-a-date"
# → 422
```

### Pre-backfill state — confirmed

```bash
# Existing employee (seeded before feature) has no salary history yet
curl "https://salary-management-production-9819.up.railway.app/api/employees/000959f7-daac-4123-b8e1-37ca69813ab0/salary?date=2026-06-10"
# → 404: "No salary record found for this employee on or before the given date"
```

---

## How to fully test after deploying our branch

### Step 1 — Deploy

Merge `dev` → `main`. Railway auto-deploys on push to `main`. CI must pass first.

### Step 2 — Backfill existing employees

```bash
railway run npm run backfill:salary-history:prod
```

Expected output:
```
🔄 Starting salary history backfill...
  Found 10000 employees with no salary history
  Backfilled 10000 / 10000 employees...
✅ Backfilled 10000 salary history records in Xs
```

Running it again is safe:
```
⏭️  All employees already have salary history. Skipping.
```

### Step 3 — Test existing employee (post-backfill)

```bash
curl "https://salary-management-production-9819.up.railway.app/api/employees/000959f7-daac-4123-b8e1-37ca69813ab0/salary?date=2026-06-10"
# → 200: { salary: 104122, currency: "USD", employee_id: "000959f7-...", ... }
```

### Step 4 — Full happy path (new employee)

```bash
# 1. Create employee — snapshot recorded automatically on create
curl -s -X POST "https://salary-management-production-9819.up.railway.app/api/employees" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Alice HR Test","job_title":"Engineer","country":"India","salary":80000}'
# note the id

# 2. Query salary today → 80000
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=2026-06-10"

# 3. Give Alice a raise
curl -X PUT "https://salary-management-production-9819.up.railway.app/api/employees/<id>" \
  -H "Content-Type: application/json" \
  -d '{"salary":95000}'

# 4. Query the day before the raise → still 80000
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=2026-06-09"

# 5. Query today → 95000
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=2026-06-10"
```

### Step 5 — Edge cases

```bash
# Past date before hire date → 404
curl "https://salary-management-production-9819.up.railway.app/api/employees/<id>/salary?date=1990-01-01"

# Non-existent employee → 404
curl "https://salary-management-production-9819.up.railway.app/api/employees/non-existent-id/salary?date=2026-06-10"
```

---

## Automated test coverage

```
src/salary-history/
  repository/in-memory-salary-history.repository.test.ts   — 5 tests
  repository/prisma-salary-history.repository.test.ts      — 3 tests
  salary-history.service.test.ts                           — 3 tests
  salary-history.router.test.ts                            — 4 tests
src/employee/
  employee.service.test.ts                                 — 3 new tests (snapshot recording)
```

Run all:
```bash
npm test
# Test Suites: 14 passed
# Tests:       105 passed
```

---

## Commits included in this feature

| Hash | Description |
|---|---|
| `429c5d1` | test: fail — in-memory salary history repo |
| `89e0073` | feat: in-memory repo green |
| `7d5fd16` | test: fail — salary history service |
| `6878e88` | feat: `getSalaryAtDate` on service |
| `e33e97e` | test: fail — salary history router |
| `88b4f13` | test: fail — error handler middleware |
| `8896264` | feat: full domain layer wired (types, repo, service, router, `NotFoundError`) |
| `2ddd6f4` | feat: Prisma migration for `SalaryHistory` table |
| `9401b4d` | test: fail — Prisma repo |
| `5377037` | fix: seed real employee in Prisma repo test |
| `4c936aa` | feat: `PrismaSalaryHistoryRepository` + wired into `app.ts` |
| `6e44caa` | test: fail — employee service snapshot recording |
| `b97c918` | feat: record snapshots on employee create and salary update |
