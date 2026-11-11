# School Admission System

An online, first-come-first-served school admission seat reservation platform built with .NET 10, PostgreSQL 16, React 18+ (TypeScript, Vite, Tailwind CSS), and Docker Compose.

---

## Quick Start (Single Command)

To build and run the entire application stack (`db`, `api`, and `web`):

```bash
docker compose up --build
```

Once running:
- **Frontend Portal:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8080](http://localhost:8080)
- **Class List API Endpoint:** [http://localhost:8080/classes](http://localhost:8080/classes)

To run in the background (detached mode):
```bash
docker compose up -d --build
```

To stop all containers and preserve database data:
```bash
docker compose down
```

To stop and wipe database data (clean state):
```bash
docker compose down -v
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | .NET 10 (C#), ASP.NET Core Controller API, Entity Framework Core 10, Npgsql |
| **Database** | PostgreSQL 16 with row-level locking |
| **Frontend** | React 18 (18.3.1), TypeScript, Vite, Tailwind CSS, Lucide React, Shadcn-style UI |
| **Testing** | xUnit, Testcontainers, Vitest, React Testing Library |
| **DevOps** | Multi-stage Dockerfiles, Docker Compose, Nginx (Alpine) |

---

## Environment Variables

All core settings can be configured via environment variables at the repository root:

| Variable | Default Value | Description |
|---|---|---|
| `HOLD_DURATION_SECONDS` | `600` | Expiration window in seconds for held seats. |
| `API_BASE_URL` | `http://localhost:8080` | URL consumed by the browser to reach the backend API. |
| `ConnectionStrings__Default` | `Host=db;Port=5432;Database=admission;Username=admin;Password=jotilpassword` | PostgreSQL connection string for the API service. |

---

## Automated Tests

### 1. Backend Tests (xUnit + Testcontainers)

The backend test suite executes against real ephemeral PostgreSQL containers spun up via Testcontainers, validating concurrency, seat safety, and business rules:

```bash
cd backend
dotnet test
```

Test coverage includes:
- Concurrency test: 50 concurrent seat hold requests competing for 5 available seats (verifying held + confirmed never exceeds total seats).
- Idempotent confirmation test: Repeated confirmations increase confirmed seat count only once.
- Seat release on expiry: Dynamic seat return calculation.
- One active hold per class per student constraint.

### 2. Frontend Tests (Vitest + React Testing Library)

The frontend test suite validates student ID verification, live countdown timers, automatic zero-reload expiry (UI Rule 9), language toggle, and seat restoration:

```bash
cd frontend
npm test
```

To run a production build test:
```bash
cd frontend
npm run build
```

---

## API Specification

All request and response bodies use JSON. Student identity is supplied via the `X-Student-Id` header (17-digit birth registration number).

| # | Method | Path | Header | Description | Success Response |
|---|---|---|---|---|---|
| 1 | `POST` | `/classes` | None | Create new class | `201 Created` |
| 2 | `GET` | `/classes` | None | Get all classes with live seat counts | `200 OK` |
| 3 | `GET` | `/classes/{classId}` | None | Get specific class details | `200 OK` |
| 4 | `POST` | `/classes/{classId}/holds` | `X-Student-Id` | Reserve a seat (temporary hold) | `201 Created` |
| 5 | `GET` | `/holds/{holdId}` | None | Check application status and expiry | `200 OK` |
| 6 | `POST` | `/holds/{holdId}/confirm` | `X-Student-Id` | Confirm admission (pay fee) | `200 OK` |
| 7 | `DELETE` | `/holds/{holdId}` | `X-Student-Id` | Cancel application (release seat) | `204 No Content` |
| 8 | `GET` | `/me/holds` | `X-Student-Id` | Get all applications for current student | `200 OK` |

---

## Key Features

- **No Passwords or Logins:** Student identity is tied directly to the 17-digit government birth registration number entered on the portal.
- **Dynamic Expiry Calculation:** Expired seats are calculated dynamically on read time and marked on write time without needing brittle background cron workers.
- **Strict Concurrency Protection:** Uses PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) inside an explicit transaction to eliminate race conditions under heavy traffic.
- **Bilingual Interface:** Full bilingual support (Bengali and English) with zero hardcoded UI strings.
- **Real-Time UI Updates:** Polling updates seat occupancy every 3–5 seconds without page reload. When countdown reaches 0, UI transitions to `EXPIRED` and fee payment is disabled automatically.
