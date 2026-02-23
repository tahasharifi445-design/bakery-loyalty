# Slide Deck Script — James Bakery Digital Loyalty System

Use this as a word-for-word delivery script for `TECHNICAL_REPORT_SLIDES.md`. Read it as written; transitions are included.

## 1. Title & Context
“Welcome. This session is about the James Bakery Digital Loyalty System—our shift from paper punch cards to a secure, auditable digital workflow. The stack is an Express TypeScript API with PostgreSQL, a React/Vite single-page app, and Dockerized Postgres for easy setup. Every claim I make points back to code and commands in this repository.”

## 2. Agenda
“Here’s our path today: the problem and goals, the architecture and data model, the end-to-end UI journey, our development process, testing and evidence, deployment, risks and limitations, the roadmap, and finally the evidence that links directly to files and command outputs. I’ll keep transitions tight so each piece connects cleanly.”

## 3. Problem & Goals
“Paper and punch cards get lost, can’t be audited, and create disputes. Staff need fast, reliable lookup and redemption. Owners need confidence that balances are correct. Our goals: secure staff login, phone-based lookup and creation, transactional earning and redemption, and admin controls without touching the database. Success means JWT-authenticated staff, normalized phone search, points awarded per configured rate, and rewards that can be toggled on or off.”

## 4. Architecture Overview
“We deliberately built a monolith: an Express API with JWT auth and role checks, a React SPA with AuthContext for state, and PostgreSQL via Sequelize for relational integrity. Docker Compose brings up Postgres locally. This keeps operations simple for a single store and fits the team’s skill set. There’s no CI/CD yet—builds run locally with Yarn.”

## 5. Backend Highlights
“Under `/v1` you’ll see auth, customers, transactions for earning, redemptions, rewards, and admin for config, rewards, and staff. Middleware verifies JWTs and roles. Business rules include phone normalization and uniqueness, transactions around earn and redeem to keep balances correct, and admin guardrails to prevent self-deactivation. The supporting code is in `backend/src/routes`, `backend/src/models`, and `backend/src/utils/phone.ts`.”

## 6. Frontend Highlights
“The SPA flow is Login to Home, then Customer Lookup or Admin. AuthContext holds the JWT; service modules call the API. Screens cover login, lookup or create, purchase, redemption, and admin panels. Navigation is role-aware—admins see config, rewards, and staff management. The React code lives in `frontend/src/pages`, `frontend/src/services`, and `frontend/src/contexts/AuthContext.tsx`.”

## 7. Database & Migrations
“Postgres tables include customers with points_balance, staff_users with hashed PINs and roles, loyalty_config for the earn rate, rewards, transactions, and redemptions. UUIDs come from pgcrypto. Migrations are uniquely timestamped and ordered; the seed inserts an admin, two rewards, and the default earn rate. Check `backend/migrations` and `backend/seeders/20260207160000-seed-initial-data.js`.”

## 8. API & Auth
“Auth is `POST /v1/auth/login` with name and PIN, returning a JWT; `GET /v1/auth/me` validates the session. Core flows: `/v1/customers` and `/v1/customers/lookup` for identities, `/v1/transactions/purchase` to earn, `/v1/rewards` to list, `/v1/redemptions` to redeem. Admin endpoints adjust earn rate, manage rewards, and toggle staff. Our security posture expects HTTPS, strong secrets, JWT expiry, and CORS configured per environment.”

## 9. UI Workflow (End-to-End)
“A staff member logs in, lands on Home with their role and ID, and can navigate to lookup or admin if authorized. On Customer Lookup, they enter a phone: if found, they see balance and actions; if not, they create a customer via modal. For a purchase, they enter the amount; points are awarded per earn rate and the new balance is shown. For redemption, they pick a reward; points are deducted or an insufficient-points message appears. Admins can adjust earn rate, create, update, and toggle rewards, and activate or deactivate staff with a self-deactivate guard. Logout clears the token and returns to login.”

## 10. Development Process
“We delivered in small epics: auth, customers, earning, redemption, admin, and UI polish. Branches flowed into PRs; the active branch is `copilot/generate-final-capstone-report` with commits like `e80249d`, `9ab258e`, `a51d06c`, and `9ce9b05`. A traceability table maps requirements to endpoints, UI components, and code files. There’s no CI/CD—Yarn builds and manual checks serve as validation.”

## 11. Testing & Evidence
“Environment: Node 24.13 with Corepack Yarn, Postgres 16 via Docker. Commands run: `yarn build` for backend and frontend, `yarn db:migrate`, and `yarn db:seed`. Curl tests verified login, 404 on unknown customer, create customer, successful purchase, and 409 on insufficient points for redemption. The Vite build produced roughly a 67.53 kB gzipped main JS bundle. All outputs are captured in the report appendix.”

## 12. Deployment Runbook (Yarn + Docker)
“Deployment steps: `docker compose up -d` to start Postgres on 5433. Backend: `yarn install`, set `.env` with DATABASE_URL, JWT_SECRET, and CORS_ORIGIN, run `yarn db:migrate`, `yarn db:seed`, then `yarn build && yarn start` on port 4000. Frontend: `yarn install`, then `yarn dev` or `yarn build` and serve `dist` on 5173. Success means migrations applied, seeds present—admin and rewards—API reachable on 4000, and UI reachable on 5173.”

## 13. Security & Risk
“Controls include JWT with expiry and role checks, bcrypt PIN hashing, CORS and helmet configuration, and transactional writes for balances. Risks include credential misuse, CORS misconfiguration, migration drift, and token theft if served without HTTPS. Mitigations are strong secrets, HTTPS, controlled origins, rollback commands, and a planned move to httpOnly and refresh tokens with rate limiting.”

## 14. Limitations
“We have no CI/CD and no automated tests; verification is manual. Scope is single-store; there’s no multi-location or offline support. Tokens are stored in localStorage, and there are no refresh tokens yet. Analytics and advanced reporting are deferred.”

## 15. Future Work (Prioritized)
“Priorities are: add CI with smoke tests; harden auth with refresh and httpOnly cookies plus rate limiting; add structured logging and metrics; refactor into a service layer with tests; and extend to multi-location support and analytics and reporting.”

## 16. Evidence Appendix (Pointers)
“For proof, review backend routes, models, migrations, and the seeder; frontend services, pages, and AuthContext; command logs for Yarn install and build, db:migrate, db:seed, and docker compose; and curl outputs for core API flows. Every slide maps back to these artifacts.”
