# Architecture

## Layered Architecture (SOLID)

```
HTTP Request
    ↓
[ Routes ]          → only HTTP wiring
    ↓
[ Controller ]      → request validation, response shaping
    ↓
[ Service ]         → business logic, depends on *interface*
    ↓
[ Repository ]      → data access (implements interface)
    ↓
[ Prisma + SQLite ]
```

**Why this layering?**
- Each layer has one reason to change (Single Responsibility)
- Service depends on `IEmployeeRepository`, not on Prisma directly (Dependency Inversion)
- Swap SQLite → Postgres by changing only the Repository (Open/Closed)
- Tests inject `InMemoryEmployeeRepository` — no DB needed (Liskov)

---

## Database Schema

```
Employee
  id              String    @id @default(uuid())
  full_name       String
  job_title       String
  department      String
  country         String
  salary          Float
  currency        String    @default("USD")
  employment_type String    @default("full_time")  -- full_time | part_time | contract
  hire_date       DateTime  @default(now())
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
```

---

## API Contract

### Employees
| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| GET    | /api/employees          | List (paginated, filterable) |
| GET    | /api/employees/:id      | Get one                  |
| POST   | /api/employees          | Create                   |
| PUT    | /api/employees/:id      | Update                   |
| DELETE | /api/employees/:id      | Delete                   |

**Query params for GET /api/employees:**
- `page` (default: 1)
- `limit` (default: 20)
- `country`
- `job_title`
- `search` (matches full_name)

### Insights
| Method | Path                              | Description                     |
|--------|-----------------------------------|---------------------------------|
| GET    | /api/insights/country/:country    | Min/max/avg salary for country  |
| GET    | /api/insights/job-title           | Avg salary by title + country   |
| GET    | /api/insights/departments         | Headcount per department        |
| GET    | /api/insights/top-earners         | Top N highest paid              |

---

## SOLID Map

| Principle | Where applied |
|-----------|---------------|
| S — Single Responsibility | Validator, Service, Repository, Controller each do one thing |
| O — Open/Closed | Add new insight metric via new method, no edits to existing |
| L — Liskov | InMemoryRepo and PrismaRepo are interchangeable |
| I — Interface Segregation | IEmployeeRepository and IInsightsRepository are separate |
| D — Dependency Inversion | Service depends on interface, not Prisma directly |