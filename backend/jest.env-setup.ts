// This runs BEFORE any test file imports prisma.ts
// dotenv/config in prisma.ts will NOT override this
// because dotenv respects already-set env vars by default
process.env.DATABASE_URL = 'file:./test.db'
