# PayShield – Smart Payment Fraud Detection & Transaction Monitoring System

PayShield is a **payment transaction simulation platform** that analyzes every
transaction in real time using a machine learning fraud detection model.
Users create simulated payments; a Python ML service scores each one for
fraud risk; and the backend approves, flags, or blocks the transaction based
on that score.

> ⚠️ **Not a real payment gateway.** No banking or payment provider is
> integrated. All money movement is simulated for demonstration purposes.

---

## Why this project exists

Fraud detection is one of the most common real-world problems in fintech
engineering. This project demonstrates:

- Designing a transaction system the way a payments company would (status
  workflow, idempotency, audit trail)
- Integrating a trained ML model into a live backend via a REST API
- Making risk-based decisions (approve / flag / block) instead of a simple
  binary fraud/not-fraud label
- Clean separation between application backend and ML inference service

---

## Tech Stack

| Layer          | Technology                                             |
|----------------|---------------------------------------------------------|
| Frontend       | React, TypeScript, Vite, Tailwind CSS, Recharts          |
| Backend        | Java 21, Spring Boot 3, Spring Security, Spring Data JPA |
| Database       | PostgreSQL                                              |
| ML Service     | Python 3.11, FastAPI, Scikit-learn, XGBoost, Pandas      |
| Auth           | JWT, BCrypt                                             |
| Infra          | Docker, Docker Compose                                  |
| Testing        | JUnit 5, Mockito, Pytest                                |
| Docs           | Swagger / OpenAPI                                       |

---

## Architecture

```
React Frontend
      │
      │ REST API (JWT-authenticated)
      ▼
Spring Boot Backend  ──────────────┐
      │                            │
      ▼                            ▼
PostgreSQL                 Fraud Detection API
(users, payments,          (FastAPI + XGBoost)
 fraud_analysis,                   │
 idempotency_keys)                 ▼
                            Fraud Probability +
                            Risk Level + Decision
                                    │
                                    ▼
                          Spring Boot applies decision
                          (SUCCESS / FLAGGED / BLOCKED)
                                    │
                                    ▼
                            React Dashboard
```

Only two backend services exist: the **Spring Boot API** and the **FastAPI ML
service**. No microservices, message queues, or container orchestration —
kept intentionally simple so every part is easy to reason about and explain.

---

## Core Features

- **Authentication** — Register/Login with JWT, BCrypt password hashing,
  role-based access (`USER`, `ADMIN`)
- **Payment Simulation** — Create transactions (`PAYMENT`, `TRANSFER`) via
  `UPI`, `CARD`, `NET_BANKING`, or `WALLET`
- **Idempotency** — Duplicate submissions (same `Idempotency-Key` header)
  return the original transaction instead of creating a new one
- **Fraud Detection** — Every transaction is scored by an XGBoost model
  trained on the PaySim dataset, returning a fraud probability, risk level
  (`LOW` / `MEDIUM` / `HIGH`), and decision
- **Transaction Status Workflow**:
  `CREATED → PROCESSING → (SUCCESS | FLAGGED | BLOCKED)`
- **Admin Dashboard** — Transaction volume, fraud rate, status breakdown,
  and time-series charts
- **User Dashboard** — Create payments, view history, see fraud risk per
  transaction

---

## Idempotency — Why It Matters

Payment systems must guarantee a request is processed **at most once**, even
if the client retries due to a network timeout, double-click, or crash.

**How PayShield implements it:**

1. Every `POST /api/payments` request must include an `Idempotency-Key`
   header (client-generated, typically a UUID).
2. The backend checks the `idempotency_keys` table for `(user_id, key)`.
   - **If found** → the original transaction is returned as-is. No new
     processing, no duplicate charge.
   - **If not found** → the key is stored, the transaction is created and
     processed normally.
3. This makes retried requests safe, which is essential for any real
   payment API.

---

## Project Structure

```
payshield/
├── frontend/            React + TypeScript + Vite dashboard
├── backend/             Spring Boot API (controller/service/repository/...)
├── fraud-service/       FastAPI ML inference service
├── datasets/            PaySim dataset (not committed — see .gitignore)
├── docs/                Additional documentation, diagrams, API notes
├── docker-compose.yml   Runs backend + fraud-service + PostgreSQL together
├── README.md
└── PROJECT_PROGRESS.md  Phase-by-phase build log
```

---

## API Overview

| Method | Endpoint                     | Description                     |
|--------|-------------------------------|----------------------------------|
| POST   | `/api/auth/register`          | Create a new user               |
| POST   | `/api/auth/login`              | Authenticate, receive JWT       |
| POST   | `/api/payments`                | Create a simulated payment      |
| GET    | `/api/payments`                | List current user's payments    |
| GET    | `/api/payments/{id}`           | Get a specific payment          |
| GET    | `/api/admin/analytics`         | Aggregate fraud/transaction stats (ADMIN) |
| GET    | `/api/admin/transactions`      | List all transactions (ADMIN)   |
| POST   | `/predict` (FastAPI service)   | Get fraud probability for a transaction |

Full request/response contracts are documented via Swagger once the backend
is running (`/swagger-ui.html`).

---

## Running the Project

> Setup instructions will be filled in as each phase is completed —
> Docker Compose will eventually bring up PostgreSQL, the backend, and the
> ML service with a single command.

---

## Development Status

This project is being built in phases. See [`PROJECT_PROGRESS.md`](./PROJECT_PROGRESS.md)
for what's done, what's in progress, and what's next.
