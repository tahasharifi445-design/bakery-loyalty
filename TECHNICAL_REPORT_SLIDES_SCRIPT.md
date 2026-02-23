# Slide Deck Script — James Bakery Digital Loyalty System (Professor-Facing Recording)

Use this as a verbatim script for a recorded presentation to your professor. Read it word for word. Each slide includes brief rationale so the flow feels natural and technically grounded.

## 1. Title & Context
“Hi Professor. In this recording I’ll walk you through the James Bakery Digital Loyalty System. We replaced paper punch cards with a secure, auditable digital flow. The stack is an Express TypeScript API on PostgreSQL, a React/Vite single-page app, and Dockerized Postgres for repeatable setup. Every statement I’ll make is backed by code and command outputs in this repo.”

## 2. Agenda
“Here’s the roadmap for this walkthrough: the problem and goals; the architecture and data model; the end-to-end UI journey; how we organized development; the testing evidence; the deployment runbook; risks and limitations; the forward roadmap; and finally where each claim maps back to source files and logs. I’ll keep transitions explicit so the narrative stays connected.”

## 3. Problem & Goals
“Paper punch cards were easily lost and impossible to audit, leading to balance disputes. Staff need fast, reliable lookup and redemption; the owner needs trustworthy balances. Our goals were secure staff login, phone-based lookup and creation, transactional earning and redemption, and admin controls without direct database access. Success means JWT-authenticated staff, normalized phone search, points awarded per configured rate, and rewards that can be toggled on or off—those are enforced directly in code.”

## 4. Architecture Overview
“We chose a monolith to minimize operational overhead for a single-store context. The Express API enforces JWT auth and role checks; PostgreSQL with Sequelize maintains relational integrity; React with AuthContext holds session state in the SPA. Docker Compose brings up Postgres locally. There’s no CI/CD yet—Yarn builds and manual runs keep feedback fast within the course timeline. This balance keeps the footprint small while meeting the bakery’s speed and cost constraints.”

## 5. Backend Highlights
“Under `/v1`, routes cover auth, customers, earning transactions, redemptions, rewards, and admin for config, rewards, and staff. Middleware verifies JWTs and roles. Business rules include phone normalization and uniqueness, transactional earn and redeem to prevent drift, and admin guardrails to block self-deactivation. All of this is inspectable in `backend/src/routes`, `backend/src/models`, and `backend/src/utils/phone.ts`, so behavior is transparent.”

## 6. Frontend Highlights
“The SPA flows Login → Home → Lookup/Create → Purchase or Redemption, with Admin sections when the role allows it. AuthContext holds the JWT; service modules call the API. Screens cover login, lookup/create, purchase, redemption, and admin panels for earn-rate config, rewards, and staff toggles. Code sits in `frontend/src/pages`, `frontend/src/services`, and `frontend/src/contexts/AuthContext.tsx`, aligning UI actions directly to the API endpoints.”

## 7. Database & Migrations
“The database stores customers with points_balance, staff_users with hashed PINs and roles, loyalty_config for the earn rate, rewards, transactions, and redemptions. UUIDs come from pgcrypto. Migrations are uniquely timestamped, and the seed inserts an admin, two rewards, and the default earn rate. These live in `backend/migrations` and `backend/seeders/20260207160000-seed-initial-data.js`, giving us deterministic, auditable setup.”

## 8. API & Auth
“Auth uses `POST /v1/auth/login` with name and PIN to return a JWT, and `GET /v1/auth/me` to validate sessions. Core flows: `/v1/customers` and `/v1/customers/lookup` for identities, `/v1/transactions/purchase` to earn, `/v1/rewards` to list, `/v1/redemptions` to redeem, plus admin endpoints for earn rate, rewards, and staff toggles. Security assumptions are HTTPS in front, strong secrets, JWT expiry, and environment-scoped CORS.”

## 9. UI Workflow (End-to-End)
“Let me narrate the user journey we implemented. A staff member logs in and lands on a role-aware Home. They navigate to Customer Lookup: if the phone exists, they see the balance and actions; if not, they create the customer. For a purchase, they enter the amount; points are awarded per the configured earn rate and the updated balance is shown. For redemption, they choose a reward; points deduct or an insufficient-points message appears. Admins can adjust the earn rate, manage rewards, and activate or deactivate staff, with a guard against self-deactivation. Logout clears the token and returns to login. This sequence matches the shipped screens.”

## 10. Development Process
“We delivered in small epics: auth, customers, earning, redemption, admin, and UI polish. Work merged through the `copilot/generate-final-capstone-report` branch with commits like `e80249d`, `9ab258e`, `a51d06c`, and `9ce9b05`. A traceability table ties each requirement to endpoints, UI components, and code paths. There’s no CI/CD; Yarn builds and manual validation kept us moving within the semester scope.”

## 11. Testing & Evidence
“Environment details: Node 24.13 with Corepack Yarn, Postgres 16 via Docker. Executed commands: `yarn build` for backend and frontend, `yarn db:migrate`, `yarn db:seed`. Curl tests verified login, a 404 for unknown customers, creating a customer, a successful purchase, and a 409 on insufficient points during redemption. The Vite build produced about a 67.53 kB gzipped main JS bundle. These outputs are captured in the appendix so the recording stays evidence-backed.”

## 12. Deployment Runbook (Yarn + Docker)
“Here’s exactly how to run what you’re seeing. `docker compose up -d` starts Postgres on 5433. Backend: `yarn install`, set `.env` with DATABASE_URL, JWT_SECRET, and CORS_ORIGIN, then `yarn db:migrate`, `yarn db:seed`, and `yarn build && yarn start` on port 4000. Frontend: `yarn install`, then `yarn dev` or `yarn build` and serve `dist` on 5173. We consider it successful when migrations apply, seeds are present, the API is reachable at 4000, and the UI is reachable at 5173.”

## 13. Security & Risk
“Security controls in place: JWT with expiry and role checks, bcrypt PIN hashing, CORS and helmet configuration, and transactional writes to protect balances. Key risks: credential misuse, CORS misconfiguration, migration drift, or token theft if HTTPS is absent. Mitigations: strong secrets, HTTPS termination, restricted origins, rollback commands, and planned upgrades to httpOnly plus refresh tokens with rate limiting.”

## 14. Limitations
“Current gaps to acknowledge: no CI/CD, no automated tests, and single-store scope. No offline support, tokens are in localStorage, and there are no refresh tokens yet. Analytics and advanced reporting are out of scope. Calling these out keeps the recorded briefing honest about what ships today.”

## 15. Future Work (Prioritized)
“If we extend this, the order is: add CI with smoke tests; harden auth with refresh and httpOnly cookies plus rate limiting; add structured logging and metrics; introduce a service layer with tests; and expand to multi-location support with analytics. This shows the path to production maturity.”

## 16. Evidence Appendix (Pointers)
“To verify every statement I’ve made, inspect backend routes, models, migrations, and the seeder; frontend services, pages, and AuthContext; command logs for Yarn install/build, db:migrate, db:seed, and docker compose; and curl outputs for the API flows. Each slide points back to these artifacts so the recording remains credible end to end.”
