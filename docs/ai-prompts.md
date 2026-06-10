# AI Prompts Log

This documents meaningful prompts used throughout development.

## Architecture design
> "I'm building a salary management tool for 10,000 employees.
>  Design a SOLID-compliant layered architecture in Node.js + Express + TypeScript.
>  It must be extensible for a future pair programming interview."

**Key output**: The IEmployeeRepository interface pattern, separation of
InsightsService from EmployeeService (Interface Segregation), and the
InMemory/Prisma dual-repository pattern for test isolation.

## TDD scaffolding
> "Help me write a failing test first for EmployeeValidator.
>  Then the minimum code to make it pass. Don't write more than I ask for."

**Key learning**: Keeping AI to one red→green cycle at a time prevented
over-engineering. When I asked for too much at once, the output was harder to commit atomically.

## Debugging Prisma v7
> "I'm getting PrismaClientInitializationError on new PrismaClient() in Prisma 7.8.0.
>  The error says it needs non-empty PrismaClientOptions. What changed in v7?"

**Resolution**: Prisma v7 introduced prisma.config.ts. Added import 'dotenv/config'
to it and regenerated the client. Documented in tradeoffs.md.

## Test database isolation
> "My Jest tests share the same SQLite file as my dev server.
>  Running tests wipes seeded data. How do I isolate them cleanly?"

**Resolution**: setupFiles in jest.config.ts sets DATABASE_URL before any
import runs. dotenv never overrides pre-set env vars, so prisma.ts picks up
the test DB URL automatically.

## Recharts testing
> "How do I test a Recharts BarChart component in Vitest + jsdom
>  without hitting SVG/canvas rendering issues?"

**Resolution**: vi.mock('recharts') replaces components with simple divs
that render data-testid attributes. Tests verify data flow, not SVG output.

## What AI accelerated
- Boilerplate (Prisma schema, tsconfig, jest setup): ~80% faster
- Debugging unfamiliar errors (Prisma v7, ts-jest config): very fast
- Writing repetitive test scaffolding: significant time saving

## Where AI needed oversight
- Occasionally wrote too much code at once (violating TDD law 1)
- Sometimes suggested global state patterns that conflicted with DI design
- Required manual review of every generated file before committing

## New Feature prompt

I'm working on a feature in this project — an employee salary management system for HR built with:

Express + TypeScript backend
Repository pattern: IXxxRepository interface → InMemoryXxxRepository (tests) + PrismaXxxRepository (production)
Dependency injection via constructors
Composition root in src/app.ts — only place real implementations are wired
Tests never hit the real DB — always use in-memory repos seeded in beforeEach
We are pair programming using strict TDD (Red → Green → Refactor).

My role: I write tests first, attempt the implementation, ask you to check my work or explain things I don't understand.

Your role: Check if my code is correct and explain what's wrong if not. Don't write the full solution immediately — guide me step by step. When I ask "what next", give me the next single step only. Explain the WHY behind every decision. When something needs documenting, add it to docs/<feature-name>.md.

TDD flow: agree on what to build → I write the test (Red) → you check it → I write implementation (Green) → you check it → run npm test → next step.

Relevant files to read first:

src/app.ts
src/employee/employee.service.ts
src/employee/employee.router.ts
src/employee/employee.controller.ts
src/shared/types/employee.types.ts
src/employee/repository/employee.repository.interface.ts
prisma/schema.prisma