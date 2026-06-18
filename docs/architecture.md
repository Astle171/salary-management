# Architecture — Salary Management Tool

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Layered Architecture](#2-layered-architecture)
3. [SOLID Principles Map](#3-solid-principles-map)
4. [Database Schema](#4-database-schema)
5. [API Contract](#5-api-contract)
6. [Backend File Structure](#6-backend-file-structure)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Frontend File Structure](#8-frontend-file-structure)
9. [Data Flow — Employee CRUD](#9-data-flow--employee-crud)
10. [Data Flow — Salary Insights](#10-data-flow--salary-insights)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Key Design Decisions](#13-key-design-decisions)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React)                          │
│   EmployeeListPage         InsightsDashboard                    │
│   ┌──────────────────┐     ┌──────────────────────────────┐    │
│   │ Table + Filters  │     │ StatCards + BarChart + Top10 │    │
│   │ Form + Modals    │     │ Country selector             │    │
│   └──────┬───────────┘     └───────────┬──────────────────┘    │
│          │  TanStack React Query         │                       │
│          │  (cache · stale-time 30s)     │                       │
│          └───────────────┬───────────────┘                      │
│                          │ fetch /api/*                         │
└──────────────────────────┼──────────────────────────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │        Express REST API            │
         │        Node.js · TypeScript        │
         │                                    │
         │  Routes → Controller → Service     │
         │             ↓                      │
         │       IRepository (interface)      │
         │             ↓                      │
         │    PrismaRepository (impl)         │
         └─────────────────┬──────────────────┘
                           │
         ┌─────────────────▼──────────────────┐
         │       Prisma ORM                   │
         │       SQLite (dev / prod)          │
         └────────────────────────────────────┘
```

---

## 2. Layered Architecture

Each layer has a **single reason to change**. Dependencies always point inward — outer layers know about inner layers, never the reverse.

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  ROUTES  (employee.router.ts · insights.router.ts)  │
│  Responsibility: HTTP verb + path wiring only        │
│  Does NOT: validate, business logic, touch DB        │
└─────────────────────┬───────────────────────────────┘
                      │ calls
                      ▼
┌─────────────────────────────────────────────────────┐
│  CONTROLLER  (employee.controller.ts)               │
│  Responsibility: parse request, shape response       │
│  Does NOT: business rules, direct DB access          │
│  Uses: Zod middleware for request validation         │
└─────────────────────┬───────────────────────────────┘
                      │ calls
                      ▼
┌─────────────────────────────────────────────────────┐
│  SERVICE  (employee.service.ts · insights.service)  │
│  Responsibility: all business logic                  │
│  Does NOT: know about HTTP, know about Prisma        │
│  Depends on: IEmployeeRepository (interface)  ← D   │
└─────────────────────┬───────────────────────────────┘
                      │ calls (via interface)
                      ▼
┌─────────────────────────────────────────────────────┐
│  INTERFACE  (employee.repository.interface.ts)       │
│  IEmployeeRepository: find · findById · create       │
│                       update · delete · count         │
│  IInsightsRepository: getCountryStats                │
│                       getJobTitleStats               │
│                       getDepartmentDistribution      │
│                       getTopEarners                  │
└──────┬──────────────────────────────┬───────────────┘
       │ (tests)                      │ (production)
       ▼                              ▼
┌─────────────┐              ┌──────────────────────┐
│  InMemory   │              │  Prisma Repository   │
│  Repository │              │  (implements same    │
│  (no DB)    │              │   interface)         │
└─────────────┘              └──────────┬───────────┘
                                        │
                                        ▼
                             ┌──────────────────────┐
                             │  Prisma ORM          │
                             │  SQLite database     │
                             └──────────────────────┘
```

### Why this layering matters for extensibility

```
Want to add a new feature?              Touch only...
─────────────────────────────────────────────────────
New salary metric (e.g. median)    →    SalaryAggregator + 1 repo method
New filter on employee list        →    EmployeeQueryBuilder
Swap SQLite → PostgreSQL           →    datasource in schema.prisma only
Add Redis cache for insights       →    new CachedInsightsRepository
                                        (implements IInsightsRepository)
Add authentication middleware      →    new auth.middleware.ts + route wiring
```

---

## 3. SOLID Principles Map

| Principle | Where Applied | Concrete Example |
|-----------|---------------|-----------------|
| **S** — Single Responsibility | Every class does one thing | `EmployeeValidator` only validates. `PaginationHelper` only paginates. `SalaryAggregator` only aggregates. `EmployeeController` only handles HTTP. |
| **O** — Open / Closed | Extend without modifying | Add a new insight metric → add a method to `SalaryAggregator`. Add a new filter → extend `EmployeeQueryBuilder`. No existing code changes. |
| **L** — Liskov Substitution | Repos are interchangeable | `InMemoryEmployeeRepository` and `PrismaEmployeeRepository` both implement `IEmployeeRepository`. Tests swap one for the other; behaviour is identical. |
| **I** — Interface Segregation | Interfaces match their consumers | `IInsightsRepository` is separate from `IEmployeeRepository`. `InsightsService` never sees `create`, `update`, or `delete` — methods it would never use. |
| **D** — Dependency Inversion | Service depends on abstraction | `EmployeeService(repo: IEmployeeRepository)` — the constructor accepts the interface. The service never imports Prisma. Production injects `PrismaEmployeeRepository`; tests inject `InMemoryEmployeeRepository`. |

---

## 4. Database Schema

```sql
model Employee {
  id              String   @id @default(uuid())

  -- Required fields
  full_name       String
  job_title       String
  department      String
  country         String
  salary          Float

  -- Optional / defaulted fields
  currency        String   @default("USD")
  employment_type String   @default("full_time")
  -- enum: full_time | part_time | contract

  -- Timestamps
  hire_date       DateTime @default(now())
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt
}
```

### Indexes (implicit via Prisma)
- `id` — primary key, UUID
- `country` — filtered frequently in insights queries
- `job_title` — filtered in job title stats queries
- `department` — grouped in distribution queries
- `salary` — sorted in top earners, aggregated in stats

### Seed data
- **10,000 employees** generated from `first_names.txt` (100) × `last_names.txt` (100)
- Realistic salary ranges per job title (e.g. Staff Engineer: $130k–$220k)
- Random distribution across 10 countries and 13 departments
- Inserted in **batches of 500** via `prisma.employee.createMany()` (~1–2s total)

---

## 5. API Contract

### Base URL
- Development: `http://localhost:3000`
- Production:  `https://salary-management-production-9819.up.railway.app/`

### Employee Endpoints

#### `GET /api/employees`
Returns a paginated, filterable list of employees.

**Query parameters:**
| Parameter   | Type   | Default | Description                          |
|-------------|--------|---------|--------------------------------------|
| `page`      | number | 1       | Page number (1-indexed)              |
| `limit`     | number | 20      | Records per page                     |
| `country`   | string | —       | Filter by exact country name         |
| `job_title` | string | —       | Filter by exact job title            |
| `search`    | string | —       | Case-insensitive search on full_name |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "Alice Smith",
      "job_title": "Software Engineer",
      "department": "Engineering",
      "country": "India",
      "salary": 85000,
      "currency": "USD",
      "employment_type": "full_time",
      "hire_date": "2021-03-15T00:00:00.000Z",
      "created_at": "2021-03-15T00:00:00.000Z",
      "updated_at": "2021-03-15T00:00:00.000Z"
    }
  ],
  "total": 10000,
  "page": 1,
  "limit": 20
}
```

---

#### `GET /api/employees/:id`
**Response `200`:** Single `Employee` object.
**Response `404`:** `{ "error": "Employee not found" }`

---

#### `POST /api/employees`
**Request body:**
```json
{
  "full_name":       "Bob Jones",        // required
  "job_title":       "Product Manager",  // required
  "country":         "USA",              // required
  "salary":          95000,              // required, positive number
  "department":      "Product",          // optional, default: "General"
  "currency":        "USD",              // optional, default: "USD"
  "employment_type": "full_time",        // optional, default: "full_time"
  "hire_date":       "2023-06-01"        // optional, default: now
}
```
**Response `201`:** Created `Employee` object.
**Response `422`:**
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "salary", "message": "Salary must be a positive number" }
  ]
}
```

---

#### `PUT /api/employees/:id`
**Request body:** Any subset of `POST` fields (partial update).
**Response `200`:** Updated `Employee` object.
**Response `404`:** `{ "error": "Employee not found" }`
**Response `422`:** Validation error (same shape as POST).

---

#### `DELETE /api/employees/:id`
**Response `204`:** No content.
**Response `404`:** `{ "error": "Employee not found" }`

---

### Insights Endpoints

#### `GET /api/insights/country/:country`
**Response `200`:**
```json
{
  "country": "India",
  "min_salary": 35000,
  "max_salary": 220000,
  "avg_salary": 82500,
  "employee_count": 1043
}
```
**Response `404`:** `{ "error": "No employees found for country: Antarctica" }`

---

#### `GET /api/insights/job-title`
**Query parameters:** `title` (required), `country` (required).

**Response `200`:**
```json
{
  "job_title": "Software Engineer",
  "country": "India",
  "avg_salary": 88000,
  "employee_count": 215
}
```
**Response `422`:** `{ "error": "title and country query params are required" }`
**Response `404`:** When no matching records.

---

#### `GET /api/insights/top-earners`
**Query parameters:** `limit` (optional, default: 10).

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "full_name": "Carol White",
    "job_title": "Staff Engineer",
    "country": "USA",
    "salary": 218000
  }
]
```

---

#### `GET /api/insights/departments`
**Response `200`:**
```json
[
  { "department": "Engineering", "avg_salary": 95000, "employee_count": 1840 },
  { "department": "Product",     "avg_salary": 88000, "employee_count":  620 }
]
```

---

#### `GET /health`
**Response `200`:** `{ "status": "ok", "env": "production" }`

---

### Error response shape
All errors follow a consistent envelope:
```json
{ "error": "Human-readable message" }
```
Or for validation failures:
```json
{
  "error": "Validation failed",
  "details": [{ "field": "salary", "message": "Salary must be a positive number" }]
}
```

### HTTP status codes used
| Code | Meaning                        |
|------|--------------------------------|
| 200  | Success                        |
| 201  | Created                        |
| 204  | Deleted (no content)           |
| 404  | Resource not found             |
| 422  | Validation error               |
| 500  | Unexpected server error        |

---

## 6. Backend File Structure

```
backend/
├── src/
│   ├── app.ts                          Entry point — wires all routes + middleware
│   ├── server.ts                       Starts HTTP server on PORT
│   │
│   ├── employee/
│   │   ├── employee.validator.ts       Validates raw input, returns typed object
│   │   ├── employee.validator.test.ts  Unit tests — 11 tests
│   │   ├── employee.service.ts         Business logic — create/update/delete/list
│   │   ├── employee.service.test.ts    Unit tests — 13 tests (uses InMemory repo)
│   │   ├── employee.controller.ts      HTTP handler — delegates to service
│   │   ├── employee.router.ts          Route definitions for /api/employees
│   │   ├── employee.router.test.ts     Integration tests — 12 tests (Supertest)
│   │   ├── employee.schemas.ts         Zod schemas for request validation
│   │   └── repository/
│   │       ├── employee.repository.interface.ts   IEmployeeRepository
│   │       ├── in-memory-employee.repository.ts   For tests — no DB
│   │       ├── in-memory-employee.repository.test.ts  Unit tests — 14 tests
│   │       ├── prisma-employee.repository.ts      For production — uses Prisma
│   │       └── employee-query.builder.ts          Builds Prisma where + pagination
│   │
│   ├── insights/
│   │   ├── insights.service.ts         Analytics logic — aggregations
│   │   ├── insights.service.test.ts    Unit tests — 10 tests (uses InMemory repo)
│   │   ├── insights.controller.ts      HTTP handler for insights endpoints
│   │   ├── insights.router.ts          Route definitions for /api/insights
│   │   ├── insights.router.test.ts     Integration tests — 8 tests (Supertest)
│   │   └── repository/
│   │       ├── insights.repository.interface.ts   IInsightsRepository
│   │       ├── in-memory-insights.repository.ts   For tests — pure computation
│   │       └── prisma-insights.repository.ts      For production — SQL aggregations
│   │
│   ├── shared/
│   │   ├── errors/
│   │   │   └── validation.error.ts     ValidationError extends Error
│   │   ├── helpers/
│   │   │   ├── pagination.helper.ts    PaginationHelper.resolve(opts)
│   │   │   └── salary-aggregator.ts    SalaryAggregator.min/max/avg/summary
│   │   ├── middleware/
│   │   │   ├── error-handler.middleware.ts   Maps domain errors to HTTP codes
│   │   │   └── validate-request.middleware.ts Zod-powered body/query validation
│   │   └── types/
│   │       ├── employee.types.ts       Employee, FindOptions, FindResult, inputs
│   │       └── insights.types.ts       CountryStats, JobTitleStats, TopEarner…
│   │
│   ├── seed/
│   │   ├── name-generator.ts           Reads txt files, generates unique names
│   │   ├── name-generator.test.ts      Unit tests — 6 tests
│   │   ├── employee-generator.ts       Maps names to realistic employee records
│   │   ├── seed.ts                     Entry point — batched bulk insert
│   │   └── __fixtures__/
│   │       ├── first_names_fixture.txt  5 names (for fast tests)
│   │       └── last_names_fixture.txt   5 names
│   │
│   └── lib/
│       └── prisma.ts                   Singleton PrismaClient
│
├── prisma/
│   ├── schema.prisma                   DB schema + datasource config
│   └── migrations/                     Migration history (committed to git)
│
├── data/
│   ├── first_names.txt                 100 first names for seeding
│   └── last_names.txt                  100 last names for seeding
│
├── jest.config.ts                      Jest config — rootDir, setupFiles
├── jest.env-setup.ts                   Sets DATABASE_URL=test.db before tests
├── jest.global-setup.ts                Creates test.db schema via prisma db push
├── jest.global-teardown.ts             Deletes test.db after suite
├── tsconfig.json
├── railway.json                        Railway deployment config
└── Dockerfile
```

---

## 7. Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                 │
│                    Tab: Employees | Insights                    │
└──────────────┬──────────────────────────────┬──────────────────┘
               │                              │
               ▼                              ▼
  ┌────────────────────────┐     ┌────────────────────────────┐
  │   EmployeeListPage     │     │    InsightsDashboard       │
  │                        │     │                            │
  │  useEmployees(filters) │     │  useCountryStats(country)  │
  │  ┌──────────────────┐  │     │  useDepartmentDistribution │
  │  │   SearchBar      │  │     │  useTopEarners(10)         │
  │  │   CountryFilter  │  │     │                            │
  │  │   EmployeeTable  │  │     │  ┌──────────────────────┐  │
  │  │   Pagination     │  │     │  │  CountryFilter        │  │
  │  │   EmployeeModal  │  │     │  │  StatCard × 4        │  │
  │  │   DeleteDialog   │  │     │  │  SalaryBarChart       │  │
  │  └──────────────────┘  │     │  │  Top Earners Table   │  │
  └────────────────────────┘     │  └──────────────────────┘  │
                                 └────────────────────────────┘

               ┌─────────────────────────────────────┐
               │        TanStack React Query          │
               │  queryClient (staleTime: 30s)        │
               │  queryKeys (centralised cache keys)  │
               └──────────────┬──────────────────────┘
                              │
               ┌──────────────▼──────────────────────┐
               │           API Layer                  │
               │  apiClient (fetch wrapper)           │
               │  employeeApi.list/create/update...   │
               │  insightsApi.getCountryStats...      │
               └──────────────┬──────────────────────┘
                              │ fetch /api/* (proxied in dev)
                              ▼
                      Express REST API
```

### State management model
```
Server state  →  TanStack React Query   (employee list, insights data)
UI state      →  React useState         (current page, search, country)
Form state    →  React Hook Form        (field values, validation errors)
```

### Component responsibilities

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `EmployeeTable` | Render rows, empty state, skeleton | `employees`, `isLoading`, `onEdit`, `onDelete` |
| `Pagination` | Prev/next/page buttons | `currentPage`, `totalPages`, `onPageChange` |
| `SearchBar` | Debounced text input (300ms) | `value`, `onChange` |
| `CountryFilter` | Native select dropdown | `value`, `onChange`, `countries` |
| `EmployeeForm` | RHF + Zod form, create & edit | `defaultValues?`, `onSubmit`, `onCancel` |
| `EmployeeModal` | Dialog wrapper for EmployeeForm | `open`, `onClose`, `employee?`, `onSubmit` |
| `DeleteConfirmDialog` | Confirm before delete | `open`, `employee`, `onConfirm`, `onCancel` |
| `StatCard` | Single metric display | `label`, `value`, `format`, `description?` |
| `SalaryBarChart` | Recharts horizontal bar chart | `data`, `isLoading?` |

---

## 8. Frontend File Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              Base fetch wrapper + ApiError class
│   │   ├── employee.api.ts        Typed employee API functions
│   │   └── insights.api.ts        Typed insights API functions
│   │
│   ├── components/
│   │   ├── ui/                    Primitive components (shadcn-style)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx         Simple CSS overlay dialog
│   │   │   ├── input.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── badge.tsx
│   │   │
│   │   ├── employee/              Feature components — all TDD tested
│   │   │   ├── EmployeeTable.tsx          + .test.tsx (5 tests)
│   │   │   ├── Pagination.tsx             + .test.tsx (5 tests)
│   │   │   ├── SearchBar.tsx              + .test.tsx (4 tests)
│   │   │   ├── CountryFilter.tsx          + .test.tsx (5 tests)
│   │   │   ├── EmployeeForm.tsx           + .test.tsx (6 tests)
│   │   │   ├── EmployeeModal.tsx          + .test.tsx (5 tests)
│   │   │   ├── DeleteConfirmDialog.tsx    + .test.tsx (5 tests)
│   │   │   └── employee-form.schema.ts    Zod schema + inferred type
│   │   │
│   │   └── insights/              Analytics components — all TDD tested
│   │       ├── StatCard.tsx               + .test.tsx (5 tests)
│   │       └── SalaryBarChart.tsx         + .test.tsx (4 tests)
│   │
│   ├── hooks/
│   │   ├── useEmployees.ts        useQuery wrapping employeeApi.list
│   │   └── useInsights.ts         useCountryStats · useDepartmentDistribution
│   │                              useTopEarners
│   │
│   ├── pages/
│   │   ├── EmployeeListPage.tsx   Wires all employee components
│   │   └── InsightsDashboard.tsx  Wires all insights components
│   │
│   ├── lib/
│   │   ├── query-client.ts        QueryClient (staleTime: 30s, retry: 1)
│   │   ├── query-keys.ts          Centralised cache key factories
│   │   ├── formatters.ts          formatSalary(amount, currency)
│   │   └── utils.ts               cn() Tailwind class merger
│   │
│   ├── types/
│   │   ├── employee.types.ts      Mirrors backend Employee types
│   │   └── insights.types.ts      Mirrors backend insights types
│   │
│   ├── test/
│   │   ├── setup.ts               Imports @testing-library/jest-dom
│   │   ├── setup.test.ts          Smoke tests for test config
│   │   └── render-utils.tsx       renderWithProviders(ui) helper
│   │
│   ├── App.tsx                    Tab navigation shell
│   └── main.tsx                   QueryClientProvider + ReactDOM.render
│
├── nginx.conf                     SPA routing + API proxy for Docker
├── vercel.json                    SPA rewrites for Vercel
├── vite.config.ts                 Dev proxy /api → :3000, path aliases
├── tailwind.config.js
├── Dockerfile
└── package.json
```

---

## 9. Data Flow — Employee CRUD

### Create employee (happy path)

```
User fills EmployeeForm → clicks Save
         │
         ▼
React Hook Form (Zod resolver)
  validates fields client-side
         │ valid
         ▼
employeeApi.create(formData)
  → POST /api/employees
         │
         ▼ Express
Zod middleware validates request body
         │ valid
         ▼
EmployeeController.create
  → req.body already validated
         │
         ▼
EmployeeService.create(data)
  → EmployeeValidator.validate(data)   ← server-side double-check
  → repo.create(validatedData)
         │
         ▼
PrismaEmployeeRepository.create
  → prisma.employee.create({ data })
         │
         ▼
SQLite
  → INSERT INTO Employee ...
  → returns new row with id
         │
         ▼
Response 201 { id, full_name, ... }
         │
         ▼
React Query invalidates
  queryKeys.employees.list(*)
  → EmployeeTable refetches
  → new row appears in list
```

### Error path (validation failure)

```
User submits { salary: -100 }
         │
         ▼
Zod middleware catches → 422
  { error: "Validation failed",
    details: [{ field: "salary",
                message: "Salary must be a positive number" }] }
         │
         ▼
ApiError(422, message) thrown
         │
         ▼
React Query sets error state
         │
         ▼
EmployeeForm shows inline error under salary field
```

---

## 10. Data Flow — Salary Insights

```
User opens InsightsDashboard
         │
         ▼
useDepartmentDistribution()
useTopEarners(10)
  → both fire immediately (no country needed)
         │
         ▼
GET /api/insights/departments
GET /api/insights/top-earners?limit=10
         │
         ▼
InsightsController
  → InsightsService.getDepartmentDistribution()
  → InsightsService.getTopEarners(10)
         │
         ▼
PrismaInsightsRepository
  → prisma.employee.groupBy(['department'])
  → prisma.employee.findMany({ orderBy: salary desc, take: 10 })
         │
         ▼
SalaryBarChart renders  (recharts BarChart)
Top Earners table renders

─────────────────────────────────────────
User selects "India" from CountryFilter
         │
         ▼
useCountryStats("India")
  enabled: true  (fires because country is set)
         │
         ▼
GET /api/insights/country/India
         │
         ▼
PrismaInsightsRepository.getCountryStats("India")
  → prisma.employee.findMany({ where: { country: "India" } })
  → SalaryAggregator.summary(salaries)
         │
         ▼
4 StatCards render:
  Min Salary    $35,000
  Max Salary   $220,000
  Avg Salary    $82,500
  Headcount       1,043
```

---

## 11. Testing Strategy

### Philosophy
- **No real database in unit or service tests** — `InMemoryRepository` is injected
- **No mocking of business logic** — test behaviour, not implementation
- **Test DB isolation** — Jest uses `test.db`, dev uses `dev.db`, never overlap
- **Frontend tests are component-level** — components receive props, API mocked at network boundary

### Backend test pyramid

```
                    ┌─────────────┐
                    │ Integration │  8 tests
                    │  (Supertest)│  real HTTP + in-memory repo
                    └──────┬──────┘
               ┌────────────────────────┐
               │     Service tests      │  23 tests
               │  InMemory repo, no DB  │
               └────────────┬───────────┘
          ┌──────────────────────────────────┐
          │        Unit tests                │  31 tests
          │  Validator · Repository · Seed   │
          └──────────────────────────────────┘
```

### Frontend test strategy

```
┌───────────────────────────────────────────────────┐
│           Component tests (Vitest + RTL)           │
│                                                    │
│  Pure components → props in, rendered DOM out      │
│  No API calls in component tests                   │
│  Recharts mocked to avoid SVG/canvas issues        │
│  Fake timers for debounce tests                    │
│  renderWithProviders() for hook-consuming tests    │
└───────────────────────────────────────────────────┘
```

### Test counts

| Phase | File | Tests |
|-------|------|-------|
| Validator | `employee.validator.test.ts` | 11 |
| In-memory repo | `in-memory-employee.repository.test.ts` | 14 |
| Employee service | `employee.service.test.ts` | 13 |
| Insights service | `insights.service.test.ts` | 10 |
| Employee routes | `employee.router.test.ts` | 12 |
| Insights routes | `insights.router.test.ts` | 8 |
| Seed | `name-generator.test.ts` | 6 |
| **Backend total** | | **74** |
| EmployeeTable | `EmployeeTable.test.tsx` | 5 |
| Pagination | `Pagination.test.tsx` | 5 |
| SearchBar | `SearchBar.test.tsx` | 4 |
| CountryFilter | `CountryFilter.test.tsx` | 5 |
| EmployeeForm | `EmployeeForm.test.tsx` | 6 |
| EmployeeModal | `EmployeeModal.test.tsx` | 5 |
| DeleteConfirmDialog | `DeleteConfirmDialog.test.tsx` | 5 |
| StatCard | `StatCard.test.tsx` | 5 |
| SalaryBarChart | `SalaryBarChart.test.tsx` | 4 |
| **Frontend total** | | **44** |
| **Grand total** | | **118** |

### Test DB isolation mechanism

```
jest.config.ts
  globalSetup    → jest.global-setup.ts
                    execSync('prisma db push')
                    with DATABASE_URL=file:./test.db
                    Creates test.db schema once

  setupFiles     → jest.env-setup.ts
                    process.env.DATABASE_URL = 'file:./test.db'
                    Runs in every worker BEFORE any import

  globalTeardown → jest.global-teardown.ts
                    unlink('./test.db')

Key insight: dotenv never overrides already-set env vars.
So when prisma.ts runs `import 'dotenv/config'`, it sees
DATABASE_URL is already set to test.db and leaves it alone.
```

---

## 12. Deployment Architecture

```
GitHub
  │  push to main
  ▼
GitHub Actions CI
  ├── backend-tests  (Jest, test.db isolated)
  ├── frontend-tests (Vitest)
  └── frontend-build (VITE_API_URL placeholder)

         │ all green
         ▼

┌────────────────────────────────────────────────────────────────┐
│  Railway (backend)                                             │
│  ┌────────────────────────────────────────────┐                │
│  │  Node.js container (Dockerfile)            │                │
│  │  CMD: prisma migrate deploy && node dist   │                │
│  │  PORT: 3000                                │                │
│  │  ENV: DATABASE_URL, NODE_ENV, FRONTEND_URL │                │
│  └────────────────────────────────────────────┘                │
│  ┌────────────────────────────────────────────┐                │
│  │  Volume mount: /app/prisma                 │                │
│  │  Persists SQLite across deploys            │                │
│  └────────────────────────────────────────────┘                │
│  URL: https://salary-management-production-9819.up.railway.app │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Vercel (frontend)                                             │
│  ┌────────────────────────────────────────────┐                │
│  │  Static build (Vite)                       │                │
│  │  VITE_API_URL = Railway URL above          │                │
│  │  vercel.json: SPA rewrites → index.html    │                │
│  └────────────────────────────────────────────┘                │
│  URL: https://salary-management-jet.vercel.app/                │
└────────────────────────────────────────────────────────────────┘

Browser → fetch('/api/employees')
        → VITE_API_URL prefix applied
        → https://salary-management-production-9819.up.railway.app/api/employees
        → CORS header checked (FRONTEND_URL env var on Railway)
        → 200 OK
```

### Local Docker setup

```
docker compose up --build

  backend  → builds from backend/Dockerfile
             runs migrate deploy + node dist/server.js
             PORT: 3000
             volume: ./backend/prisma → /app/prisma

  frontend → builds from frontend/Dockerfile (nginx)
             nginx.conf proxies /api → backend:3000
             PORT: 8080

  Result: http://localhost:8080 → full app, no CORS issues
```

---

## 13. Key Design Decisions

### Interface before implementation
Every repository was defined as an interface first (`IEmployeeRepository`, `IInsightsRepository`). The service was written and tested against the interface before `PrismaEmployeeRepository` existed. This forced clean boundaries and made tests trivially fast.

### Two repositories per domain
Each domain has two concrete repositories:
- `InMemory*Repository` — for unit and service tests, pure in-memory `Map`, no DB
- `Prisma*Repository` — for production, uses Prisma ORM

This follows the Liskov Substitution Principle: both are interchangeable from the service's perspective.

### Separate `IInsightsRepository`
Insights queries are read-only aggregations. Having a separate interface from `IEmployeeRepository` means `InsightsService` never sees `create`, `update`, or `delete`. This is Interface Segregation in practice.

### `SalaryAggregator` as extension point
All salary math (min, max, avg) lives in one class. Adding a new metric (e.g. median, P90) means adding one method here. No changes to `InsightsService`, `PrismaInsightsRepository`, or `InMemoryInsightsRepository`. This is the Open/Closed Principle in practice.

### Zod as the single source of truth for validation
One Zod schema per resource drives:
- Runtime validation in the Express middleware
- TypeScript types via `z.infer<>`
- React Hook Form resolver on the frontend

### React Query for server state
All server data lives in React Query's cache. Components never call `fetch` directly — they use typed hooks. Cache invalidation is explicit (invalidate by query key after mutations). The `queryKeys` file is the single map of all cache keys.

### Test DB isolation via `setupFiles`
The most subtle architectural decision: `process.env.DATABASE_URL` is set in `jest.env-setup.ts` (a `setupFiles` entry), which runs before any test file is imported. Since `dotenv` never overrides pre-set env vars, the `import 'dotenv/config'` in `prisma.ts` silently skips the `.env` file. The test suite and dev server never touch the same database.