# PayShield – Project Progress

This file tracks development phase by phase. Updated after every phase is
completed and approved.

**Legend:** ✅ Done · 🔄 In Progress · ⏳ Not Started

---

## Phase Tracker

| Phase | Title                                         | Status |
|-------|------------------------------------------------|--------|
| 1     | Project Setup and Architecture                 | ✅ Done |
| 2     | Spring Boot Backend + PostgreSQL               | ⏳ Not Started |
| 3     | Authentication + JWT Security                  | ⏳ Not Started |
| 4     | Payment Transaction APIs                       | ⏳ Not Started |
| 5     | Idempotency Implementation                     | ⏳ Not Started |
| 6     | PaySim Dataset Analysis and ML Model Training  | ⏳ Not Started |
| 7     | FastAPI Fraud Detection Service                | ⏳ Not Started |
| 8     | Connect Spring Boot with ML Service            | ⏳ Not Started |
| 9     | React Frontend                                 | ⏳ Not Started |
| 10    | Admin Analytics Dashboard                      | ⏳ Not Started |
| 11    | Docker and Docker Compose                      | ⏳ Not Started |
| 12    | Testing and Documentation                      | ⏳ Not Started |

---

## Phase 1 — Project Setup and Architecture ✅

**Completed:** 2026-09-06

**What was built:**
- Reviewed and validated the full project requirements
- Finalized system architecture (React → Spring Boot → PostgreSQL / FastAPI ML service)
- Created the full folder structure: `frontend/`, `backend/`, `fraud-service/`,
  `datasets/`, `docs/`
- Created root `README.md` describing the system, stack, architecture,
  idempotency design, and API surface
- Created this `PROJECT_PROGRESS.md` phase tracker
- Added `.gitignore` for Java/Node/Python build artifacts and secrets

**Decisions made:**
- Idempotency key uniqueness is scoped to `(user_id, idempotency_key)`,
  not global, to avoid collisions between different users
- `fraud_analysis` table will store the raw ML response (probability, risk
  level, model version) per transaction for auditability
- No microservices, Kafka, Kubernetes, Redis, or observability stack — kept
  to two backend services (Spring Boot + FastAPI) as specified

**Not yet done (upcoming phases):**
- No code written yet — Phase 2 begins Spring Boot project init + entity/DB design

---

## Phase 2 — Spring Boot Backend + PostgreSQL ⏳

_Not started._

---

## Notes / Open Questions

- None currently. Will log any decisions or trade-offs here as phases progress.
