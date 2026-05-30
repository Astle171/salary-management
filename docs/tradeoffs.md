# Trade-offs & Decisions

## SQLite in production
- **Why**: Zero config, portable, sufficient for <100 concurrent users
- **Trade-off**: No concurrent writes at scale
- **Production note**: Railway volume mount persists the DB file across deploys
- **Extension path**: Change `provider = "postgresql"` in schema.prisma and
  update DATABASE_URL — zero application code changes needed (Prisma abstraction)

## InMemory repositories for tests
- **Why**: Unit tests must be fast (<1s) and not require a running database
- **Result**: 60+ tests, all complete in ~3 seconds
- **Trade-off**: Must keep InMemory implementations in sync with Prisma schema
- **Benefit**: Caught 3 bugs during development that a DB-coupled test would have hidden

## Test DB isolation (jest.env-setup.ts)
- **Why**: Tests sharing dev.db would wipe seeded data on every test run
- **Solution**: `setupFiles` sets DATABASE_URL=file:./test.db before any import
- **Key insight**: dotenv never overrides already-set env vars, so this works cleanly

## Dependency Inversion for extensibility
- **Why**: Service layer never imports Prisma — depends only on the interface
- **Benefit**: Swap SQLite→Postgres, add Redis cache, or mock in tests = one file change
- **Proof**: The pair-programming interviewer can add any new feature by
  implementing a new interface method — zero changes to existing service code

## Zod schemas as single source of truth
- **Why**: One schema drives both runtime validation and TypeScript types
- **Backend**: Zod middleware validates request bodies before they reach the controller
- **Frontend**: Same Zod schema drives React Hook Form + inline error messages
- **Trade-off**: Schema duplication between frontend and backend (acceptable for now;
  could share via a monorepo package in a larger project)

## Batched seed inserts
- **Why**: 10,000 individual INSERT statements ≈ 30s; batches of 500 ≈ 1-2s
- **Approach**: createMany() in batches of 500 — 20 round trips instead of 10,000
- **Idempotent**: Guard checks existing count before seeding, safe to run in CI