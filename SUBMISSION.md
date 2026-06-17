# Submission Write-up

## TL;DR (for non-technical readers)

This project is an internal HR tool that lets a company manage salary information for up to 10,000 employees — think of it like a secure, company-internal spreadsheet replacement with an audit trail.

**What it does:**
- Store and manage employee records (name, role, country, salary)
- Search and filter employees by name, department, or location
- Show salary statistics across the company — averages, highest, lowest, by team
- Keep a complete history of every salary change, so HR always knows what someone was paid at any point in the past

**How it was built:**
The project follows a professional engineering process called TDD (Test-Driven Development), where tests are written *before* the code. This means every feature was verified to work correctly from the start, not tested as an afterthought. The commit history shows this process in action — over 40 commits, each one a small, verified step forward.

The codebase is structured so that different parts of the system are independent: the database layer, the business rules, and the web API are kept separate. This makes the system easier to change, test, and maintain as it grows.

AI tools (specifically Claude Code) were used throughout — but deliberately and critically, not blindly. The AI helped with research, boilerplate, and debugging. Architecture decisions and code quality were human-driven.

---

## What I built and why I chose it

I built a full-stack **salary management system** for HR teams managing up to 10,000 employees.
The backend is a REST API in Node.js + TypeScript + Express with Prisma as the ORM (SQLite in dev, Postgres-compatible). The frontend is React with TanStack Query and Recharts for visualisation.

The core features:
- Employee CRUD with pagination, filtering (country, job title), and search
- Salary insights (average, min, max, median by department/country)
- Salary history tracking — every salary change is recorded as a snapshot with a timestamp, supporting point-in-time queries

I chose this over a simpler CRUD app deliberately. The salary history feature forced me to solve real problems: backfill migrations for existing employees, point-in-time queries, and a separate `SalaryHistoryService` that doesn't belong inside `EmployeeService`. That last decision is a natural demonstration of ISP and SRP — two interfaces, two services, clean boundaries.

I also chose **Express over NestJS** consciously. NestJS would have enforced DI and layering through decorators, hiding every architectural decision. Express is blank canvas — every structural choice (the `IEmployeeRepository` interface, the InMemory/Prisma dual-repo pattern, the `EmployeeValidator` as a pure function class, the composition root in `app.ts`) had to be made explicitly. That makes the architecture *visible*, which matters in an interview context.

---

## AI tools, models, and platforms used

**Primary tool: Claude Code** — Anthropic's CLI, used via the VSCode extension throughout the project.

| Role | How it was used |
|---|---|
| Architecture design | Initial prompt to design a SOLID-compliant layered architecture. Output gave me the `IXxxRepository` pattern and the InMemory/Prisma dual-repo idea. |
| TDD scaffolding | Asking for the minimum implementation to pass a specific failing test, one cycle at a time. |
| Debugging | Unblocking Prisma v7 breaking changes, Jest test isolation with SQLite, Recharts/jsdom rendering issues. |
| Boilerplate | Prisma schema, `tsconfig.json`, `jest.config.ts`, repetitive test setup. |
| Code review prep | Building the 10-point review framework, reviewing practice PRs, building the common-issues checklist. |
| Interview prep context | The `CLAUDE.md` file was built collaboratively as a living reference across sessions. |

---

## How AI influenced decisions, architecture, and direction

**Repository interface pattern** — The `IEmployeeRepository` interface with two implementations (InMemory for unit tests, Prisma for integration) came directly from the AI's architecture response. The reasoning it gave — "this makes your tests independent of the database without mocking the ORM" — was exactly right, and it shaped every subsequent design decision in the codebase.

**Insights as a separate service** — When I described the salary insights feature, Claude Code flagged that putting `getAverageSalary()` inside `EmployeeService` would violate SRP. I hadn't thought about where to put it yet. That nudge led to `InsightsService` and `IInsightsRepository` as distinct modules — a cleaner separation that also happens to be a natural interview talking point.

**Salary history design** — The initial approach I had in mind was to just add a `salary_history` array field on the employee record. Claude Code pushed back: a separate `SalaryHistory` table with a foreign key is the right normalised design, and it opens the door to point-in-time queries that a JSON array never would. The backfill migration script also came from a conversation about how to handle existing records.

**Test database isolation** — I was getting test/dev database collisions. Claude Code's suggestion of setting `DATABASE_URL` in Jest's `setupFiles` before any import runs — so `dotenv` never overwrites it — was a non-obvious solution I wouldn't have reached quickly on my own.

---

## Where AI surprised me, produced something unexpected, or changed my approach

**TDD violations** — The most consistent friction point. When I gave Claude Code a slightly broad prompt ("implement the salary history service"), it would return a complete implementation with zero tests, or worse, return tests and implementation together in one response. This directly breaks TDD law 1 (no production code before a red test). I had to develop a habit of tighter prompts: "here is the failing test — write the minimum implementation to make it pass, nothing else." Claude Code generally respected that constraint when given it explicitly, but never remembered it session to session.

**Prisma v7 hallucination** — When debugging a `PrismaClientInitializationError`, Claude Code confidently described a `prisma.config.ts` API that it said was "introduced in v7". The description sounded plausible and consistent — but some of the details were wrong. The config file is real, but the specific options it described didn't match the actual Prisma v7 docs. I had to cross-reference the Prisma changelog to filter what was real. The lesson: AI is very good at *direction* ("you need a prisma.config.ts") and unreliable on *exact API details* — always verify against source docs.

**Global state suggestion** — During a refactor, Claude Code suggested a module-level singleton for `PrismaClient` ("just export a shared instance from `prisma.ts`"). Simpler code, but it breaks dependency injection. Every test that imports the service would share the same client instance, making test isolation hard. I pushed back and kept constructor injection. The AI accepted the correction without friction — it wasn't *wrong* exactly, just optimising for a different goal (simplicity over testability).

**Recharts testing** — I was stuck on how to unit-test components that render SVG via Recharts in jsdom. Claude Code's suggestion to `vi.mock('recharts')` with stub components that render `data-testid` attributes was genuinely clever — it decoupled the test from the SVG rendering entirely and let me verify data flow. I wouldn't have reached that pattern on my own without more googling.

**Code review acceleration** — This surprised me most. Using Claude Code to review practice PRs and score my findings against a hidden answer key turned what would have been vague self-study into a structured drill. The gap between my score (4/9 on PR 2) and the answer key made it concrete what I was missing — route shadowing, TDD commit signals — in a way that reading theory wouldn't have.

---
