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


Key design decisions:
- **Dependency Inversion**: Service depends on `IEmployeeRepository`, never Prisma
- **InMemory repositories** in all tests — zero DB calls in unit/integration tests
- **Test DB isolation**: Jest uses `test.db`, dev uses `dev.db` (never overlap)

---

## Local setup

### Option A — One command with Docker

```bash
git clone https://github.com/your/salary-management
cd salary-management
docker compose up --build

# Backend:  http://localhost:3000
# Frontend: http://localhost:8080
```

### Option B — Manual

**Backend**
```bash
cd backend
npm install
cp .env.example .env          # set DATABASE_URL
npx prisma migrate dev
npm run seed                  # seeds 10,000 employees
npm run dev                   # http://localhost:3000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

---

## Running tests

```bash
# Backend (Jest + Supertest — uses isolated test.db)
cd backend && npm test

# Frontend (Vitest + React Testing Library)
cd frontend && npm test

# Coverage
cd backend && npm run test:coverage
```

---

## Features

### Employee management
- Paginated list with search (by name) and filter (by country)
- Add / Edit / Delete via modal form with Zod validation
- 10,000 employees seeded via performant batched insert (500/batch)

### Salary insights
- Min / max / avg salary per country
- Avg salary by job title + country
- Department salary distribution (bar chart)
- Top 10 earners across the organisation

---

## Project structure
salary-management/
├── backend/
│   ├── src/
│   │   ├── employee/        CRUD — validator, service, repository, controller
│   │   ├── insights/        Analytics — service, repository, controller
│   │   └── shared/          Error types, helpers, middleware
│   ├── prisma/              Schema + migrations
│   └── data/                first_names.txt, last_names.txt
├── frontend/
│   └── src/
│       ├── components/      EmployeeTable, Pagination, SearchBar,
│       │                    EmployeeForm, StatCard, SalaryBarChart
│       ├── hooks/           useEmployees, useInsights
│       └── pages/           EmployeeListPage, InsightsDashboard
└── docs/                    Architecture, AI prompts, trade-offs

---

## Commit history

Commits follow a strict **TDD cycle**: