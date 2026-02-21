# Slide Deck Outline — James Bakery Digital Loyalty System

## 1. Title & Context
- Project: James Bakery Digital Loyalty System
- Audience: Execs, client, and stakeholders
- Repo alignment: Express (TypeScript) API + PostgreSQL + React/Vite SPA

## 2. Agenda
- Problem & objectives
- Architecture & data
- UI workflow
- Process, testing, deployment
- Risks, limitations, and next steps
- Evidence appendix

## 3. Problem & Goals
- Replace fragile paper/punch-card loyalty
- Ensure accurate earn/redeem with audit trail
- Minimize counter friction; fast POS workflow
- MVP success criteria: secure login, lookup/create customer, earn, redeem, admin controls

## 4. Architecture Overview
- Monolithic Express API with JWT auth
- React + Vite SPA (AuthContext, role-based nav)
- PostgreSQL via Sequelize (transactions for balance updates)
- Dockerized Postgres for local/runbook deployment

## 5. Backend Highlights
- Routes: auth, customers, transactions (earn), redemptions, admin (config, rewards, staff)
- Middleware: JWT verification, role checks
- Business rules enforced at route + DB constraints

## 6. Frontend Highlights
- Screens: Login → Home → Customer Lookup/Create → Purchase → Redemption → Admin (config/rewards/staff)
- State: AuthContext storing JWT; service wrappers per domain
- Navigation: Home entry, role-gated Admin

## 7. Database & Migrations
- Tables: customers, staff_users, loyalty_config, rewards, transactions, redemptions
- UUID keys; points_balance on customers; earn_rate single-row config
- Unique, ordered migrations; seed for admin + rewards + config

## 8. API & Auth
- Auth: `POST /v1/auth/login`, `GET /v1/auth/me`
- Core flows: `/v1/customers`, `/v1/transactions/purchase`, `/v1/redemptions`, `/v1/rewards`
- Admin: `/v1/admin/config`, `/v1/admin/rewards*`, `/v1/admin/staff*`

## 9. UI Workflow (End-to-End)
- Login (name + PIN) → Home (role/ID, nav)
- Customer Lookup; branch: found (summary) vs not found (create modal)
- Purchase: enter amount → points awarded, balance updated
- Redemption: select reward → deduct points or show insufficient
- Admin (role=admin): adjust earn rate, manage rewards, toggle staff
- Logout returns to login

## 10. Development Process
- Lightweight Agile iterations by epic (auth, customers, earning, redemption, admin, UI polish)
- Branching: feature branches → PRs; yarn builds as validation
- Traceability table: requirement → endpoint → UI → backend/frontend files

## 11. Testing & Evidence
- Environment: Node 24.13, Yarn (Corepack), Postgres 16 (docker)
- Commands: `yarn build` (backend/frontend), `yarn db:migrate`, `yarn db:seed`
- Manual API checks (curl): login, lookup 404, create customer, purchase success, redemption 409
- Vite build output: main JS ~67.53 kB gzipped

## 12. Deployment Runbook (Yarn + Docker)
- `docker compose up -d` (Postgres 16 on 5433)
- Backend: `yarn install`, set `.env`, `yarn db:migrate`, `yarn db:seed`, `yarn build && yarn start`
- Frontend: `yarn install`, `yarn dev` or `yarn build` + serve `dist/`
- Expected: migrations applied, seeds inserted, API on 4000, UI on 5173

## 13. Security & Risk
- HTTPS + JWT expiry; role checks; bcrypt PIN hashing
- Risks: credential misuse, balance corruption, CORS misconfig, migration drift
- Mitigations: transactions, validation, strong secrets, documented rollbacks

## 14. Limitations
- No CI/CD; manual verification
- Single-store scope; no multi-location
- Tokens in localStorage; no refresh/httpOnly cookies yet
- No automated tests; analytics/reporting deferred

## 15. Future Work (Prioritized)
- CI + smoke tests; auth hardening (refresh/httpOnly, rate limiting)
- Structured logging/metrics; service-layer refactor with tests
- Multi-location/store scoping; analytics/reporting

## 16. Evidence Appendix (Pointers)
- Files: backend routes/models/migrations/seeders; frontend services/pages/components
- Command logs: yarn install/build, db:migrate, db:seed, docker compose up
- API curl results for core flows
