# Speaker Notes & Expanded Talking Points — James Bakery Digital Loyalty System

Use these notes alongside `TECHNICAL_REPORT_SLIDES.md`. Each section maps to a slide; keep spoken delivery concise, evidence-backed, and aligned with the repository.

## 1. Title & Context
- Introduce the project: digital loyalty replacement for a single-location bakery.
- Emphasize stack: Express (TypeScript) API, PostgreSQL via Sequelize, React + Vite SPA, Dockerized Postgres for easy spin-up.
- Highlight audience: execs, client stakeholders, technical reviewers.

## 2. Agenda
- Briefly walk through the flow: problem/objectives → architecture/data → UI journey → process/testing/deployment → risks/limitations → next steps → evidence.
- Set expectation: each topic will tie back to repo files and runbook commands.

## 3. Problem & Goals
- Pain: paper/punch cards are lost, disputable, and lack analytics; staff need fast, reliable flows.
- Goals: accurate earn/redeem with auditability; minimal POS friction; admin control without DB work.
- MVP definition: secure login, lookup/create customer, earn, redeem, admin toggles.
- Success criteria: JWT-authenticated staff, normalized phone lookup, transactional balance updates, configurable earn rate, reward activation toggles.

## 4. Architecture Overview
- Monolithic by intent: lowers ops overhead for a single store; easier to deploy and reason about.
- API: Express with JWT auth middleware; role checks gate admin routes.
- Frontend: React SPA with AuthContext; navigation adjusts by role.
- Data: PostgreSQL for relational integrity; Sequelize models and transactions for balances.
- Infra: Docker Compose for Postgres; env-driven config; no CI/CD yet (manual builds).

## 5. Backend Highlights
- Key routes: `/v1/auth`, `/v1/customers`, `/v1/transactions/purchase`, `/v1/rewards`, `/v1/redemptions`, `/v1/admin/*`.
- Middleware: `auth.middleware.ts` verifies JWT, enforces role; consistent error payloads.
- Business rules: phone normalization, unique phone constraint, transactional earn/redeem, admin guardrails (no self-deactivate).
- Point to files: `backend/src/routes/*.ts`, `backend/src/models/*.ts`, `backend/src/utils/phone.ts`.

## 6. Frontend Highlights
- Screens: Login → Home → Customer Lookup/Create → Purchase → Redemption → Admin.
- State: AuthContext stores JWT; service modules encapsulate API calls.
- UX choices: simple forms, clear error states, role-based visibility for Admin.
- Point to files: `frontend/src/pages/*.tsx`, `frontend/src/services/*.ts`, `frontend/src/contexts/AuthContext.tsx`.

## 7. Database & Migrations
- Tables and purpose: customers (balance), staff_users (roles, PIN hash), loyalty_config (earn rate), rewards, transactions, redemptions.
- UUIDs via pgcrypto; points_balance column on customers; indexes on history tables.
- Ordered migrations with unique timestamps; seed inserts admin + two rewards + earn rate.
- Point to files: `backend/migrations/*.js`, `backend/seeders/20260207160000-seed-initial-data.js`.

## 8. API & Auth
- Auth flow: `POST /v1/auth/login` (name + PIN) → JWT with role; `GET /v1/auth/me` for session check.
- Core business flows: lookup/create customers, purchase (earn), redemption, rewards list.
- Admin flows: config earn rate, reward CRUD/activation, staff activation toggles.
- Security stance: HTTPS expected, JWT expiry, bcrypt PIN hashing, CORS configured via env.

## 9. UI Workflow (End-to-End)
- Start: Login → token stored in AuthContext/localStorage.
- Home: shows role/ID, nav to lookup or admin (if admin).
- Lookup: phone search; branch to summary if found; modal to create if not.
- Purchase: enter amount → earn points → new balance confirmed.
- Redemption: select reward → deduct or show insufficient points.
- Admin: adjust earn rate; create/update/toggle rewards; toggle staff (with self-deactivate guard).
- Logout: clears token and returns to login.

## 10. Development Process
- Agile-lite: increments by epics (auth, customers, earning, redemption, admin, UI polish).
- Evidence of workflow: branch `copilot/generate-final-capstone-report`; commits `e80249d`, `9ab258e`, `a51d06c`, `9ce9b05`, etc.
- Traceability: table maps requirement → endpoint → UI → backend/frontend files.
- Honesty: no CI/CD; builds run locally with yarn; manual validation.

## 11. Testing & Evidence
- Environment: Node 24.13, Yarn (Corepack), Postgres 16 via docker.
- Commands executed: `yarn build` (backend/frontend), `yarn db:migrate`, `yarn db:seed`, curl tests for login/lookup/create/purchase/redemption 409.
- Outcomes: migrations/seed success logs; Vite build gzip ~67.53 kB main JS; API responses validated.
- Emphasize reproducibility: commands + expected outputs in report appendix.

## 12. Deployment Runbook (Yarn + Docker)
- Steps: `docker compose up -d`; backend `yarn install`, set env, `yarn db:migrate`, `yarn db:seed`, `yarn build && yarn start`; frontend `yarn install`, `yarn dev` or `yarn build` + serve dist.
- Expected results: Postgres live on 5433; migrations applied; seeds inserted; API on 4000; UI on 5173.
- Call out pool settings and CORS/JWT secret requirements for production hardening.

## 13. Security & Risk
- Controls: JWT + role checks; bcrypt PINs; helmet/CORS; transactions protect balances.
- Risks: credential misuse, CORS misconfig, migration drift, token theft (localStorage).
- Mitigations: HTTPS, strong secrets, rollback commands, admin guardrails, future move to httpOnly/refresh + rate limiting.

## 14. Limitations
- No CI/CD; no automated tests; single-store scope.
- Tokens in localStorage (not httpOnly); no refresh tokens.
- Limited analytics/reporting; no multi-location or offline support.

## 15. Future Work (Prioritized)
- CI + smoke tests; auth hardening (refresh/httpOnly, rate limits).
- Structured logging/metrics; service-layer refactor with tests.
- Multi-location/store scoping; analytics/reporting roadmap.

## 16. Evidence Appendix (Pointers)
- Point to concrete files: backend routes/models/migrations/seeders; frontend services/pages/components.
- Reference command logs: yarn install/build, db:migrate, db:seed, docker compose up.
- Mention sample curl outputs for core flows to prove functionality.
