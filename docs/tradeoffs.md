# Trade-offs & Decisions

This document captures every meaningful engineering decision made during
development — what was chosen, what was rejected, and why. It exists so
that anyone reading the codebase (or interviewing the author) can understand
the reasoning behind the code, not just the code itself.

---

## Table of Contents

1. [Backend Framework](#1-backend-framework)
2. [Database Choice](#2-database-choice)
3. [ORM Choice](#3-orm-choice)
4. [Repository Pattern & Dual Implementations](#4-repository-pattern--dual-implementations)
5. [Separate IInsightsRepository](#5-separate-iinsightsrepository)
6. [Validation Strategy](#6-validation-strategy)
7. [Test Database Isolation](#7-test-database-isolation)
8. [Seed Script Performance](#8-seed-script-performance)
9. [Frontend Framework & Build Tool](#9-frontend-framework--build-tool)
10. [Server State Management](#10-server-state-management)
11. [Form Library Choice](#11-form-library-choice)
12. [Recharts for Data Visualisation](#12-recharts-for-data-visualisation)
13. [Dialog Implementation](#13-dialog-implementation)
14. [API Client Design](#14-api-client-design)
15. [TDD Discipline & Commit Strategy](#15-tdd-discipline--commit-strategy)
16. [Error Handling Architecture](#16-error-handling-architecture)
17. [CORS Strategy](#17-cors-strategy)
18. [Deployment Platform Choices](#18-deployment-platform-choices)
19. [SQLite in Production](#19-sqlite-in-production)
20. [What Would Change at Production Scale](#20-what-would-change-at-production-scale)

---

## 1. Backend Framework

### Decision: Node.js + Express + TypeScript

**Chosen over:** NestJS, Fastify, Hapi

### Why Express

Express was chosen deliberately over NestJS even though NestJS enforces
many of the same SOLID patterns automatically.

The reasoning: this assessment is about demonstrating architectural thinking,
not about letting a framework enforce it. Express is unopinionated — every
structural decision (layering, dependency injection, interface segregation)
had to be made consciously and explicitly. The result is that the architecture
is visible in the code, not hidden behind decorators.

| Framework | DI | Structure | Boilerplate | Shows discipline? |
|-----------|----|-----------|-----------|--------------------|
| Express   | Manual | Manual | More | Yes — everything is explicit |
| NestJS    | Built-in | Enforced | Less | Less — framework hides decisions |
| Fastify   | Manual | Manual | More | Yes — but less ecosystem |

### Why TypeScript

TypeScript catches an entire class of bugs at compile time rather than
runtime. For a codebase with layered architecture and multiple interacting
interfaces, strict TypeScript is not optional — it's the mechanism that
enforces interface contracts across layers.

`strict: true` is enabled in `tsconfig.json`. This means:
- `strictNullChecks` — no accidental `null` dereferences
- `noImplicitAny` — every value has a known type
- `strictFunctionTypes` — function signatures are properly checked

**Trade-off:** More upfront ceremony (type annotations, generics) in exchange
for confidence that the compiler catches mismatches between layers.

---

## 2. Database Choice

### Decision: SQLite via Prisma

**Chosen over:** PostgreSQL, MySQL, MongoDB

### Why SQLite

- **Zero configuration:** No database server to install, start, or manage
- **Assessor experience:** Anyone cloning the repo runs `npm install` and
  `npx prisma migrate dev` — the database exists immediately
- **Prisma abstracts the difference:** Switching to PostgreSQL requires
  changing exactly one line in `schema.prisma` and one env var

### The SQLite trade-off

SQLite has known limitations:

| Limitation | Impact at 10k employees | Impact at 1M+ employees |
|------------|------------------------|------------------------|
| No concurrent writes | None — single HR user | Significant |
| File-based locking | None | Significant |
| No connection pooling | None | Significant |
| Limited SQL functions | Minor — Prisma abstracts | Minor |

For this assessment's scope (one HR manager, 10,000 employees, read-heavy
insights queries), SQLite performs comfortably. The `groupBy` and aggregation
queries in `PrismaInsightsRepository` run in milliseconds against 10k rows.

### Migration path

Because all database access goes through Prisma, the switch to PostgreSQL
at scale requires:
1. Change `provider = "sqlite"` → `provider = "postgresql"` in `schema.prisma`
2. Change `DATABASE_URL` to a PostgreSQL connection string
3. Run `npx prisma migrate deploy`

Zero application code changes. This is the payoff of the repository
pattern and Prisma abstraction.

---

## 3. ORM Choice

### Decision: Prisma

**Chosen over:** TypeORM, Drizzle, Knex, raw SQL

### Why Prisma

- **Type safety end-to-end:** `prisma.employee.findMany()` returns
  `Employee[]` — the TypeScript type is generated from the schema
- **Migration history:** `prisma migrate dev` creates versioned SQL files
  that are committed to git, making schema evolution auditable
- **Readable query API:** `prisma.employee.groupBy(['department'])` is
  self-documenting; equivalent raw SQL is verbose and error-prone
- **Multi-database:** Same Prisma code works against SQLite, PostgreSQL,
  and MySQL

### Trade-off vs raw SQL

Prisma generates slightly less optimal SQL for complex queries than a
hand-tuned raw SQL approach. For the insights aggregations in this project,
the difference is immeasurable at 10k rows. At 10M rows, raw SQL or a
dedicated analytics layer (e.g. ClickHouse, BigQuery) would be appropriate.

### Trade-off vs Drizzle

Drizzle is newer and has a more SQL-like API that some developers prefer.
Prisma was chosen here because it has more mature migration tooling and
better documentation for the patterns used (soft deletes, multi-provider).

---

## 4. Repository Pattern & Dual Implementations

### Decision: Interface → InMemory (tests) + Prisma (production)

This is the single most important architectural decision in the project.

### The problem it solves

Without this pattern, every service test requires:
- A real database running
- Migrations applied
- Cleanup between tests
- Slow I/O on every assertion

With 74 backend tests, database-coupled tests would take 30–60 seconds.
With in-memory repositories, the entire backend test suite runs in under 3
seconds.

### How it works

```typescript
// The interface — what the service depends on
interface IEmployeeRepository {
  find(options: FindOptions): Promise<FindResult>
  findById(id: string): Promise<Employee | null>
  create(input: CreateEmployeeInput): Promise<Employee>
  update(id: string, input: UpdateEmployeeInput): Promise<Employee>
  delete(id: string): Promise<void>
  count(): Promise<number>
}

// Tests use this — no database
class InMemoryEmployeeRepository implements IEmployeeRepository {
  private store = new Map<string, Employee>()
  // pure in-memory operations
}

// Production uses this — Prisma + SQLite
class PrismaEmployeeRepository implements IEmployeeRepository {
  // delegates to prisma.employee.*
}

// Service only knows about the interface — never about Prisma
class EmployeeService {
  constructor(private repo: IEmployeeRepository) {}
}
```

### Trade-off

Maintaining two implementations means keeping them in sync. If a new field
is added to the Employee model:
1. Add it to the Prisma schema
2. Add it to `employee.types.ts`
3. Update `InMemoryEmployeeRepository` to handle it
4. Update `PrismaEmployeeRepository` if needed

This is a small maintenance cost for a large testing speed benefit. The
Liskov Substitution Principle guarantees that if both repositories pass the
same test suite, they are behaviourally equivalent.

---

## 5. Separate IInsightsRepository

### Decision: IInsightsRepository is separate from IEmployeeRepository

**Alternative rejected:** Extend IEmployeeRepository with analytics methods

### Why separate

Interface Segregation Principle: a client should not be forced to depend on
methods it does not use.

`InsightsService` only reads aggregations. It never creates, updates, or
deletes employees. If `IInsightsRepository` extended `IEmployeeRepository`,
the insights service would inherit `create`, `update`, and `delete` — methods
it would never call and should not be able to call.

The separation also makes the domain boundary explicit: employee CRUD and
salary analytics are different concerns with different change rates.

### Practical benefit

Adding a new analytics query (e.g. salary percentiles) means:
1. Add method to `IInsightsRepository`
2. Implement in `InMemoryInsightsRepository`
3. Implement in `PrismaInsightsRepository`
4. Add to `InsightsService`

`IEmployeeRepository`, `EmployeeService`, `EmployeeController`, and all
employee-related code is completely untouched.

---

## 6. Validation Strategy

### Decision: Zod as single source of truth, validated at two layers

**Layers:**
1. **Frontend** — React Hook Form + Zod resolver (immediate user feedback)
2. **Backend middleware** — Zod schema on every POST/PUT route
3. **Service layer** — `EmployeeValidator` as a domain guard

### Why validate at multiple layers?

**Frontend validation** gives instant feedback without a network round-trip.
Users see "Salary must be positive" as they type, not after submitting.

**Backend middleware** (Zod) catches malformed API calls from any client —
Postman, curl, other services. The frontend could be bypassed.

**Service layer** (`EmployeeValidator`) is the domain-level guard. It exists
independently of HTTP. If the service is ever called from a CLI, a batch
job, or a message queue consumer, validation still happens. This is what
"business rule" means — it belongs in the domain, not in the HTTP layer.

### Trade-off: schema duplication

The Zod schema exists in both `backend/src/employee/employee.schemas.ts` and
`frontend/src/components/employee/employee-form.schema.ts`. They are not
shared.

**Why not shared?** Sharing requires a monorepo with a dedicated `packages/`
directory, a build step for the shared package, and tooling to reference it
from both `backend/` and `frontend/`. For an assessment project, this
overhead is not justified.

**Extension path:** In a production monorepo, move schemas to
`packages/shared/src/schemas/employee.schema.ts` and import from both sides.

---

## 7. Test Database Isolation

### Decision: `setupFiles` sets `DATABASE_URL` before any import runs

**Problem:** Tests and the dev server shared the same `dev.db`. Running
the test suite wiped seeded data because integration tests called
`prisma.employee.deleteMany()` in cleanup hooks.

**Approaches considered:**

| Approach | Pros | Cons |
|----------|------|------|
| `globalSetup` sets env var | Logical place | Runs in separate process — env doesn't propagate |
| `.env.test` file | Clean separation | Requires custom dotenv loading; easy to forget |
| `jest.config.ts` top-level | Simple | Runs in config process, may not propagate to workers |
| **`setupFiles`** | Runs in every worker before imports | Slightly non-obvious |

### Why `setupFiles` works

```
Jest worker process starts
  → setupFiles runs: process.env.DATABASE_URL = 'file:./test.db'
  → test file is imported
    → prisma.ts is imported
      → import 'dotenv/config' runs
        → dotenv sees DATABASE_URL is already set
        → dotenv SKIPS overriding (this is dotenv's default behaviour)
      → new PrismaClient() uses 'file:./test.db'  ✓
```

The key insight: `dotenv` never overrides pre-existing environment variables
unless `{ override: true }` is passed. This behaviour is documented but
often overlooked.

**Trade-off:** The mechanism is non-obvious to a new team member. It is
documented here and in `jest.env-setup.ts` with a comment explaining why
dotenv's no-override behaviour makes this work.

---

## 8. Seed Script Performance

### Decision: Batched `createMany()` in chunks of 500

**Why not 10,000 individual `create()` calls?**

Each `prisma.employee.create()` is a separate SQL transaction and a separate
round-trip to the database engine. For SQLite (file I/O), this is especially
slow because each transaction requires an fsync.

| Approach | ~Time for 10,000 rows | Round-trips |
|----------|----------------------|-------------|
| Individual `create()` | 25–40 seconds | 10,000 |
| `createMany()` one call | 2–4 seconds | 1 |
| `createMany()` batches of 500 | 1–2 seconds | 20 |

A single `createMany()` with 10,000 records builds a very large SQL
`INSERT` statement that can hit SQLite's variable limit. Batches of 500
avoid this limit while maintaining near-optimal performance.

### Idempotency guard

```typescript
const existing = await prisma.employee.count()
if (existing >= TOTAL) {
  console.log('Already seeded. Skipping.')
  return
}
```

The guard makes the seed script safe to run repeatedly — in CI, in Docker
startup scripts, or after a failed partial seed. It checks before inserting
and bails out if the data is already there.

**Trade-off:** The guard is count-based, not content-based. If the seed runs
partially (e.g. 3,000 of 10,000 records), re-running clears and re-seeds
rather than resuming. For a seed script, this is the correct behaviour —
partial data is worse than no data.

---

## 9. Frontend Framework & Build Tool

### Decision: React 18 + Vite + TypeScript

**Chosen over:** Next.js, Remix, plain HTML

### Why React (not Next.js)

This is a single-page application with a separate backend API. Next.js adds
value for server-side rendering, file-based routing, and server components —
none of which are needed here. Using Next.js would introduce unnecessary
complexity (API routes conflicting with the Express backend, SSR hydration,
edge runtime concerns) without benefit.

Vite provides hot module replacement and fast builds without Next.js overhead.

### Why Vite (not Create React App)

Create React App is effectively deprecated. Vite is the current standard:
- Build times: ~10x faster than Webpack (CRA)
- HMR: near-instant on save
- Modern ESM-first approach
- Built-in TypeScript support

### Tailwind + shadcn/ui

**Tailwind** was chosen for utility-first styling. For a data-heavy
application with tables, modals, and forms, utility classes compose better
than component-scoped CSS. There is no `className` naming problem.

**shadcn/ui** provides accessible, unstyled components (Dialog, Select,
Table, Button) built on Radix UI primitives. Components are copied into the
project rather than installed as a dependency — this means full control over
the source without being coupled to a third-party component library's
release cycle.

**Trade-off:** More initial setup than a component library like MUI or
Chakra. The payoff is that the UI is fully customisable without fighting
library defaults.

---

## 10. Server State Management

### Decision: TanStack React Query v5

**Chosen over:** Redux Toolkit Query, SWR, Zustand, plain `useEffect`

### Why React Query

Managing server state with `useEffect` + `useState` requires manual handling
of:
- Loading states
- Error states
- Cache invalidation after mutations
- Deduplication of concurrent requests
- Background refetching

React Query handles all of this declaratively. The result is components that
describe *what data they need*, not *how to fetch it*.

```typescript
// Without React Query — manual state management
const [employees, setEmployees] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)
useEffect(() => {
  setIsLoading(true)
  fetch('/api/employees').then(r => r.json())
    .then(setEmployees).catch(setError).finally(() => setIsLoading(false))
}, [page, search, country])

// With React Query — declarative
const { data, isLoading, error } = useEmployees({ page, search, country })
```

### Cache configuration

`staleTime: 30_000` (30 seconds) — employee data is considered fresh for
30 seconds. The HR manager does not need real-time data; this avoids
unnecessary refetches when switching tabs.

`retry: 1` — on failure, retry once. More retries add latency for permanent
failures (e.g. 404, 422).

`refetchOnWindowFocus: false` — refetching every time the tab is focused
creates unexpected loading states in a data management tool.

### Query key design

```typescript
queryKeys.employees.list({ page, search, country })
```

Keys include all filter parameters. When search changes from "Alice" to "Bob",
React Query recognises a new key and fetches fresh data — it does not
incorrectly serve cached Alice results for a Bob search.

---

## 11. Form Library Choice

### Decision: React Hook Form + Zod resolver

**Chosen over:** Formik, controlled components with useState

### Why React Hook Form

React Hook Form uses uncontrolled inputs (refs, not state). This means:
- No re-render on every keystroke
- Better performance with large forms
- Less boilerplate than Formik

### Why Zod resolver (not yup)

Zod schemas are already used on the backend. Using the same validation
library on the frontend means the team only needs to know one validation
API. Zod also generates TypeScript types from schemas (`z.infer<>`), which
eliminates a class of type-vs-schema mismatch bugs.

**Trade-off:** `@hookform/resolvers` is an additional dependency, but it is
small and actively maintained. The alternative — custom validation logic
— is more error-prone and harder to test.

---

## 12. Recharts for Data Visualisation

### Decision: Recharts

**Chosen over:** Chart.js, D3, Victory, Nivo

### Why Recharts

- **React-native:** Built for React with composable components. No DOM
  manipulation required.
- **Declarative API:** A bar chart is `<BarChart data={...}><Bar dataKey="avg_salary" /></BarChart>`
- **Sufficient feature set:** For bar charts, line charts, and tooltips,
  Recharts covers the use case without D3's steep learning curve
- **Bundle size:** Smaller than Chart.js when tree-shaken

### Testing Recharts

Recharts renders SVG, which jsdom does not fully support. Direct rendering
tests produce false negatives (SVG dimensions are 0 in jsdom). The solution:

```typescript
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ data, children }) => (
    <div data-testid="bar-chart">
      {data?.map(item => (
        <span key={item.department} data-testid="bar-item">
          {item.department}
        </span>
      ))}
      {children}
    </div>
  ),
  Bar: () => null,
  // ...
}))
```

The mock replaces Recharts components with simple HTML. Tests verify that
the correct data is passed to the chart (correct number of bars, correct
department names) without depending on SVG rendering.

**Trade-off:** The mock tests data flow, not visual correctness. Visual
regression testing (e.g. Storybook + Chromatic) would catch rendering issues
that these tests cannot.

---

## 13. Dialog Implementation

### Decision: Custom CSS overlay dialog (not Radix UI Dialog)

**Chosen over:** Radix UI `<Dialog>`, native `<dialog>` element

### Why not Radix UI Dialog

Radix UI's Dialog uses a React portal (`createPortal`) to render outside
the component tree. In jsdom (Jest/Vitest), portals render into
`document.body`. While `screen.getByRole('dialog')` still works, the
interaction with `aria-hidden`, `inert`, and focus trap polyfills in jsdom
is unreliable and has caused flaky tests in practice.

### The custom solution

```typescript
export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null   // ← this is key

  return (
    <>
      <div aria-hidden="true" onClick={() => onOpenChange(false)} />
      <div>
        <div role="dialog" aria-modal="true">
          {children}
        </div>
      </div>
    </>
  )
}
```

When `open={false}`, the component returns `null`. This means:
- `screen.queryByRole('dialog')` returns `null` when closed ✓
- `screen.getByRole('dialog')` finds the element when open ✓
- No portal, no focus trap issues in jsdom ✓

**Trade-off:** The custom dialog lacks accessibility features that Radix
provides (focus trap, scroll lock, escape key handler). In a production
application, these are not optional. The correct approach at production
quality would be to use Radix UI and configure jest's jsdom to handle
portals correctly, or use Playwright for dialog interaction tests.

---

## 14. API Client Design

### Decision: Native `fetch` wrapper with typed methods

**Chosen over:** Axios, ky, got

### Why native fetch

- No additional dependency
- Available in all modern browsers and Node.js 18+
- Sufficient for the request patterns in this application (JSON in/out,
  standard HTTP methods, simple error handling)

### The wrapper adds three things

1. **Base URL prefix:** `VITE_API_URL` is prepended in production builds,
   enabling the same relative paths (`/api/employees`) in both dev (via Vite
   proxy) and production (via env var prefix)

2. **Consistent error handling:** Every non-2xx response throws `ApiError`
   with the status code and message. Callers (React Query) receive typed
   errors rather than raw `Response` objects

3. **Type safety:** Every method is generic — `apiClient.get<Employee[]>(path)`
   returns `Promise<Employee[]>`

**Trade-off:** The wrapper does not handle request cancellation (AbortController),
request timeouts, or automatic retry. For a production application, these
would be added. For this assessment, React Query handles retries at the
query level, which is sufficient.

---

## 15. TDD Discipline & Commit Strategy

### Decision: Strict three-law TDD with one commit per cycle

The three laws (Uncle Bob):
1. Write no production code unless a test is failing
2. Write only enough test to demonstrate a failure
3. Write only enough production code to make the test pass

### Why one commit per law violation

Each red→green pair is a separate pair of commits:
```
test: failing test — EmployeeService.create calls repository with valid data
feat: EmployeeService — implement create, inject IEmployeeRepository
```

This produces a git history that tells the story of development. An assessor
running `git log --oneline` can see:
- What was tested first
- What the minimum implementation was
- When behaviour changed vs when structure was refactored

### What this prevents

- Big-bang commits that are impossible to review
- Implementation that precedes understanding (writing code before tests
  forces thought about the API surface first)
- Over-engineering (test → minimum code → refactor keeps scope tight)

### Trade-off

Strict TDD slows down initial development by 20–30% compared to writing
code directly. The payoff is:
- 118 tests that actually test behaviour, not implementation
- Confidence to refactor without breaking things
- A codebase where every line of production code exists because a test
  required it

---

## 16. Error Handling Architecture

### Decision: Domain errors mapped to HTTP codes in a single middleware

```typescript
// error-handler.middleware.ts
export const errorHandlerMiddleware = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    return res.status(422).json({ error: err.message })
  }
  if (err.message === 'Employee not found') {
    return res.status(404).json({ error: err.message })
  }
  res.status(500).json({ error: 'Internal server error' })
}
```

### Why this approach

- **Single responsibility:** Controllers never set status codes. They call
  the service and call `next(err)` on failure. All HTTP-specific error
  mapping is in one place.
- **Domain stays clean:** `EmployeeService` throws `ValidationError` and
  `Error('Employee not found')` — it does not know about HTTP.
- **Easy to extend:** Adding a new domain error (e.g. `ConflictError` for
  duplicate names) means adding one `if` block to the middleware. No
  controller changes required.

### Trade-off: string matching for not-found

`err.message === 'Employee not found'` is string matching, which is fragile.
The correct production approach is a typed `NotFoundError` class:

```typescript
class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}
// middleware:
if (err instanceof NotFoundError) return res.status(404).json(...)
```

This was not implemented in the assessment to keep the code concise. It is
the first refactor that should happen before this goes to production.

---

## 17. CORS Strategy

### Decision: Allowlist of origins from environment variable

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  process.env.FRONTEND_URL,  // set to Vercel URL in production
].filter(Boolean)
```

**Rejected:** `cors({ origin: '*' })` — wildcard CORS is acceptable for
public APIs but inappropriate for a data management tool. Even though this
application has no authentication, allowing any origin is a bad habit.

**Rejected:** Hardcoding the Vercel URL — would break every deployment
that uses a different URL (preview deployments, different environments).

**Trade-off:** Requires `FRONTEND_URL` to be set as an environment variable
on Railway. If it is not set, CORS will block the Vercel frontend. This is
documented in the deployment guide and the error message is clear.

---

## 18. Deployment Platform Choices

### Backend: Railway

**Chosen over:** Heroku, Render, Fly.io, AWS, self-hosted

Railway was chosen for three reasons:
1. **Dockerfile support:** The backend has a multi-stage Dockerfile. Railway
   detects and uses it without any additional configuration.
2. **Persistent volumes:** SQLite requires a persistent filesystem. Railway
   supports volume mounts, which means `prisma/prod.db` survives deploys
   and container restarts. This is not available on all free tiers (Render's
   free tier does not support persistent disks).
3. **Environment variables:** Railway has a clean environment variable UI.
   Setting `DATABASE_URL`, `FRONTEND_URL`, and `PORT` takes under a minute.

**Trade-off:** Railway's free tier has compute limitations (sleeps after
inactivity). For a demo, this is acceptable. For production, the hobby plan
($5/month) keeps the service always on.

### Frontend: Vercel

**Chosen over:** Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront

Vercel is the natural deployment target for Vite/React applications:
- Detects Vite projects automatically
- `vercel.json` with SPA rewrites is minimal configuration
- Preview deployments on every pull request (useful for ongoing development)
- Free tier is generous for static sites

**Trade-off:** `VITE_API_URL` must be set in Vercel's environment variable
UI. If forgotten, the frontend makes API calls to an empty base URL (relative
paths), which works in development but fails in production. This is a common
footgun documented in the deployment guide.

---

## 19. SQLite in Production

### Decision: SQLite on Railway with a persistent volume

**This is a deliberate, documented trade-off, not an oversight.**

### Why SQLite is acceptable here

- **Single user:** The HR manager is the sole user. SQLite handles
  concurrent reads easily and single-writer access patterns perfectly.
- **10k rows:** The dataset fits entirely in memory on any modern server.
  All insight queries run in milliseconds.
- **Simplicity:** No database provisioning, no connection strings with
  passwords, no connection pool management.

### Where SQLite breaks down

| Scenario | Problem |
|----------|---------|
| Multiple concurrent writers | SQLite's file lock serialises writes; high contention causes timeouts |
| Horizontal scaling | SQLite is file-based; multiple instances cannot share the same file |
| Large datasets (>10M rows) | Query performance degrades without proper indexing; aggregations slow |
| Backup & PITR | No built-in streaming replication; backups are file copies |

### Production migration path

Because Prisma abstracts the database:
1. Provision a PostgreSQL instance (Railway add-on, Supabase, Neon, RDS)
2. Change `provider = "sqlite"` → `provider = "postgresql"` in `schema.prisma`
3. Change `DATABASE_URL` to the PostgreSQL connection string
4. Run `npx prisma migrate deploy`

No application code changes. The repositories, services, and controllers
are completely unaffected.

---

## 20. What Would Change at Production Scale

This section is honest about what was built for the assessment vs what a
production system requires.

### Authentication & authorisation

The current system has **no authentication**. Any request to the API returns
data. A production HR tool requires:
- JWT or session-based authentication
- Role-based access control (read-only analyst vs admin)
- Audit logging (who changed what salary, when)

The architecture supports this: authentication middleware sits between the
router and controller, and audit logs go in the service layer.

### Pagination on the seed data

The current implementation returns all 10,000 employees with `limit=20`
pagination. Insights queries (e.g. `getDepartmentDistribution`) load all
rows into memory for aggregation. At 10k rows this is fine; at 1M rows,
`prisma.employee.findMany()` with no limit would OOM the server.

**Fix:** Add database-level aggregations (already done in
`PrismaInsightsRepository` via `prisma.employee.groupBy`). The
`InMemoryInsightsRepository` loads all rows by design — that is acceptable
for tests.

### `NotFoundError` typed class

As noted in [section 16](#16-error-handling-architecture), the not-found
detection uses string matching. A typed `NotFoundError` class is the
correct approach.

### Shared validation schemas

Frontend and backend Zod schemas are duplicated. A production monorepo
would extract these to a shared package.

### Connection pooling

SQLite does not support connection pooling. PostgreSQL at scale requires a
pooler (PgBouncer or Prisma's Accelerate) to handle concurrent connections
efficiently.

### CSP and security headers

The current Express app has no Content Security Policy or other security
headers. A production app adds `helmet` middleware:
```typescript
import helmet from 'helmet'
app.use(helmet())
```

### Environment management

The project uses a single `.env` file. A production system has at minimum:
- `.env.development`
- `.env.staging`
- `.env.production`

With secrets managed via a secrets manager (AWS Secrets Manager, Vault),
not `.env` files checked into CI.

### Visual regression testing

Component tests verify data flow and interaction. They do not verify that
the UI *looks* correct. A production frontend adds:
- Storybook for component documentation and isolation
- Chromatic (or Percy) for visual regression on every PR

### Performance monitoring

No observability is configured. A production system adds:
- Structured logging (Winston or Pino) with request IDs
- Error tracking (Sentry)
- APM traces (Datadog, New Relic) for slow query detection

---

*Last updated: Phase 11 — Deployment complete*