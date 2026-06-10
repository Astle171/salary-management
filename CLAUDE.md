# Salary Management — Interview Prep Context

## What this repo is

A salary management REST API built in Node.js + TypeScript + Prisma.
This is Astle's completed assignment for the **Incubyte Senior Node.js / TypeScript Craftsperson** role.

Assignment passed. Currently preparing for:
- **Round 2: Code Review** — review a peer's PR and leave structured feedback
- **Round 3: Pair Programming** — live TDD session with interviewer watching

---

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Prisma (SQLite for dev/test, Postgres-compatible)
- **Testing:** Jest + Supertest
- **Architecture:** Controller → Service → Repository (interface-based)

---

## Architecture conventions in this codebase

```
src/
  employee/
    employee.controller.ts        ← HTTP only: parse req, call service, send res
    employee.service.ts           ← Business logic, validation delegation
    employee.validator.ts         ← Pure validation, throws ValidationError
    employee.router.ts            ← Route registration only
    employee.schemas.ts           ← Zod schemas / DTOs
    repository/
      employee.repository.interface.ts   ← IEmployeeRepository interface
      in-memory-employee.repository.ts   ← Used in unit tests
      prisma-employee.repository.ts      ← Used in integration tests / prod
  insights/
    (same layered pattern)
  shared/
    errors/validation.error.ts    ← Custom error classes
    middleware/                   ← error-handler, validate-request
    types/                        ← Shared TypeScript types
```

**Rules:**
- Services never import Prisma directly — they depend on the repository interface
- Controllers never contain business logic
- Validators are pure functions — no side effects
- All `unknown` input is validated at the service boundary before use

---

## Code Review Framework

Use this order every time you review a PR:

```
1. Commit history          → TDD evidence? Tests before code?
2. Test quality            → Real behaviour tests or mock noise?
3. Types                   → any? unknown used correctly? DTOs defined?
4. Service layer           → SRP? God methods? Logic in wrong layer?
5. Error handling          → Existence checks? Domain errors? No raw 500s?
6. Repository/data layer   → N+1? In-memory pagination? Correct queries?
7. HTTP layer              → Correct status codes? Input validated?
8. Security                → Validation at boundaries? Data leaks in responses?
9. Route ordering          → Static routes before parameterised /:id routes?
10. Nits                   → Naming, magic strings, dead code
```

### For each issue write:
- **Where** (file + line)
- **What** the problem is
- **Why** it matters (consequence)
- **What** to do instead (concrete fix)

### Severity levels:
- **Blocking** — correctness bug, security gap, fake TDD, tests that validate wrong behaviour
- **Important** — SRP violation, missing error handling, wrong status code
- **Nit** — naming, style, minor improvements

---

## Common issues to catch in peer PRs

### TDD violations
- All tests in one commit at the end ("add test coverage")
- Only 2 commits total
- Test file and implementation file committed together

### Test quality anti-patterns
- Mocking the entire ORM (`jest.mock('@prisma/client', ...)`) — tests verify nothing real
- Tests that depend on execution order — no `beforeEach` isolation
- Test asserts the wrong value and passes (e.g. `expect(status).toBe(200)` for a POST)
- `rejects.toThrow()` without asserting error type or message
- Test description is `'it should work'` not behaviour-driven

### Architecture anti-patterns
- PrismaClient instantiated inside service (breaks DI)
- Business logic in route handlers (no service layer)
- Insights logic inside EmployeeService (SRP violation)

### Correctness bugs
- In-memory pagination: `findMany()` all rows, then `.slice()` in JS
- `salaries.reduce(...) / salaries.length` — NaN when array is empty
- `Math.max(...salaries)` — `-Infinity` when array is empty
- `page=0` or negative page → `skip = -10` → Prisma throws
- No validation in PATCH (salary=-1 silently saved)
- DELETE with no existence check → raw Prisma P2025 error

### Route ordering bug
- `router.get('/insights/salary', ...)` registered AFTER `router.get('/:id', ...)`
- Express matches `/:id` first — insights route is unreachable

### HTTP status codes
- POST should return `201`, not `200`
- DELETE with no body should return `204`
- Missing resource → `404`, not `500`
- Validation failure → `400` (missing field) or `422` (invalid value for known field)

---

## HTTP Status Code Reference

### 2xx Success
| Code | Name | Use for |
|---|---|---|
| `200` | OK | GET, PATCH, DELETE (with body) |
| `201` | Created | POST — resource created |
| `204` | No Content | DELETE — no body returned |

### 4xx Client errors
| Code | Name | Use for |
|---|---|---|
| `400` | Bad Request | Missing required fields, wrong type |
| `401` | Unauthorized | No/invalid auth credentials |
| `403` | Forbidden | Valid credentials, action not allowed |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate unique field |
| `422` | Unprocessable Entity | Valid JSON but semantically invalid (bad enum value) |

### 5xx Server errors
| Code | Name | Use for |
|---|---|---|
| `500` | Internal Server Error | Unhandled exception — should never reach client |
| `503` | Service Unavailable | Database down, external dependency unavailable |

---

## TDD Principles (Incubyte standard)

1. Write a **failing test first** — no production code without a red test
2. Write the **minimum code** to make the test pass
3. **Refactor** with tests green
4. **One commit per cycle** — commit history must show red→green→refactor
5. Tests describe **behaviour**, not implementation
6. Use **in-memory repository** for unit tests — no mocking the ORM

---

## AI Best Practices (for pair programming round)

### DO
- Write the failing test yourself, ask AI to implement
- Read AI output before accepting — push back on `any`, wrong status codes, missing guards
- Give AI precise prompts with architectural constraints
- Narrate when AI makes a mistake: "this skips the existence check — let me fix that"
- Use AI for boilerplate, repetitive patterns, syntax you half-remember
- Refactor AI output to match codebase standards

### DON'T
- Accept every suggestion without reading it
- Let AI write tests and implementation together (breaks TDD)
- Use vague prompts ("write a service for employees")
- Let AI make architecture/design decisions
- Ask AI "is this correct?" — have your own judgment

### The loop to demonstrate visibly:
```
1. You decide what to build
2. You write the failing test
3. You ask AI to implement with precise context
4. You read output → push back if needed
5. You refactor
6. Commit
```

---

## Prep progress

- [x] Code review framework established
- [x] PR 1 reviewed (with answer key)
- [x] PR 2 reviewed — scored 4/9, missed: route shadow bug, 200→201, test validates bug, order-dependent tests, TDD commit signal
- [x] HTTP status codes
- [x] AI best practices for pair programming
- [ ] PR 3 practice (harder, closer to real interview)
- [ ] Mock pair programming session (live TDD with interviewer watching)
