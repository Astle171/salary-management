# Trade-offs & Decisions

## SQLite over PostgreSQL
- **Why**: Zero-config local setup, easier for assessors to run
- **Trade-off**: Not suitable for production concurrency at scale
- **Extensibility**: Swap to Postgres by changing only the Prisma datasource URL

## InMemoryRepository for tests
- **Why**: Unit tests must be fast and not depend on a real DB
- **Trade-off**: Must keep InMemory implementation in sync with Prisma schema
- **Benefit**: Tests run in milliseconds; service logic is tested in isolation

## Express over NestJS
- **Why**: Lighter, shows manual SOLID discipline rather than framework-enforced
- **Trade-off**: More boilerplate for DI, but makes architecture decisions explicit

## Zod for validation
- **Why**: Shared schema between frontend and backend possible; type inference
- **Trade-off**: Adds a dependency, but eliminates manual type guards

## Batched seed inserts
- **Why**: 10,000 individual inserts would be very slow (~30s+)
- **Decision**: Insert in batches of 500 using createMany