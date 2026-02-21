# Slide Deck Script — James Bakery Digital Loyalty System

Use this as a delivery script for the slides in `TECHNICAL_REPORT_SLIDES.md`. Aim for a clear, confident pace; trim or expand based on allotted time.

## 1. Title & Context
“Welcome. This presentation covers the James Bakery Digital Loyalty System—our move from paper loyalty cards to a secure, auditable digital workflow. The stack is an Express TypeScript API with PostgreSQL, a React/Vite SPA, and Dockerized Postgres for easy setup. I’ll keep each point tied to code and commands in the repo.”

## 2. Agenda
“I’ll start with the problem and goals, then architecture and data, then walk the UI journey end to end. After that, I’ll cover process, testing, deployment, risks, limitations, and the roadmap. I’ll close with evidence links back to files and command outputs so everything is verifiable.”

## 3. Problem & Goals
“Paper and punch cards get lost and can’t be audited. Staff need fast, reliable lookup and redemption, and owners need confidence that balances are correct. Our goals: secure staff login, reliable phone-based lookup and creation, transactional earning and redemption, and admin controls without DB access. Success looks like JWT-authenticated staff, normalized phone search, earned points applied per configured rate, and rewards that can be toggled on or off.”

## 4. Architecture Overview
“We chose a deliberate monolith: Express API with JWT auth and role checks, React SPA with an AuthContext for state, and PostgreSQL via Sequelize for relational integrity. Docker Compose provisions Postgres locally. This keeps operations simple for a single store and matches the team’s skill set. There’s no CI/CD yet—builds run locally with Yarn.”

## 5. Backend Highlights
“Core routes are under `/v1`: auth, customers, transactions for earning, redemptions, rewards, and admin for config, rewards, and staff. Middleware verifies JWTs and roles. Business rules: phone normalization and uniqueness, transactions wrap earn and redeem to keep balances correct, and admin guardrails prevent self-deactivation. Files to see this are in `backend/src/routes`, `backend/src/models`, and `backend/src/utils/phone.ts`.”

## 6. Frontend Highlights
“The SPA flow is Login → Home → Customer Lookup or Admin. AuthContext stores the JWT; service modules call the API. Pages cover login, lookup/create, purchase, redemption, and admin panels. Navigation is role-aware—admins see config, rewards, and staff management. The React code lives in `frontend/src/pages`, `frontend/src/services`, and `frontend/src/contexts/AuthContext.tsx`.”

## 7. Database & Migrations
“Postgres tables include customers with a points_balance, staff_users with hashed PINs and roles, loyalty_config for the earn rate, rewards, transactions, and redemptions. UUIDs come from pgcrypto. Migrations are uniquely timestamped and ordered; the seed inserts an admin, two rewards, and the default earn rate. Check `backend/migrations` and `backend/seeders/20260207160000-seed-initial-data.js`.”

## 8. API & Auth
“Auth is `POST /v1/auth/login` with name and PIN, returning a JWT; `GET /v1/auth/me` validates sessions. Business flows: `/v1/customers` and `/v1/customers/lookup` for identities, `/v1/transactions/purchase` to earn, `/v1/rewards` to list, `/v1/redemptions` to redeem. Admin endpoints adjust earn rate, manage rewards, and toggle staff. Security expectations: HTTPS, strong secrets, JWT expiry, CORS configured per environment.”

## 9. UI Workflow (End-to-End)
“A staff member logs in and lands on Home with their role and ID, with nav to lookup or admin if authorized. On Customer Lookup, they enter a phone—if found, they see balance and actions; if not, they create a customer via modal. For a purchase, they enter the amount; points are awarded per earn rate and the new balance is shown. For redemption, they pick a reward; points are deducted or they see an insufficient-points message. Admins can adjust earn rate, create/update/toggle rewards, and activate/deactivate staff with a self-deactivate guard. Logout returns to the login screen and clears the token.”

## 10. Development Process
“We worked in small iterations by epic: auth, customers, earning, redemption, admin, UI polish. Branches flowed into PRs; the current branch is `copilot/generate-final-capstone-report` with commits like `e80249d`, `9ab258e`, `a51d06c`, and `9ce9b05`. A traceability table maps requirements to endpoints, UI components, and code files. There’s no CI/CD—Yarn builds and manual checks are our validation.”

## 11. Testing & Evidence
“Environment: Node 24.13 with Corepack Yarn, Postgres 16 via Docker. Commands run: `yarn build` for backend and frontend, `yarn db:migrate`, `yarn db:seed`. Curl tests validated login, 404 on unknown customer, create customer, successful purchase, and 409 on insufficient points for redemption. The Vite build produced a ~67.53 kB gzipped main JS bundle. All of these outputs are captured in the report appendix.”

## 12. Deployment Runbook (Yarn + Docker)
“To deploy: `docker compose up -d` to start Postgres on 5433. Backend: `yarn install`, set `.env` with DATABASE_URL, JWT_SECRET, CORS_ORIGIN, run `yarn db:migrate`, `yarn db:seed`, then `yarn build && yarn start` to serve on port 4000. Frontend: `yarn install`, then `yarn dev` or `yarn build` and serve `dist` on 5173. Success looks like migrations applied, seeds present (admin and rewards), API reachable on 4000, and UI reachable on 5173.”

## 13. Security & Risk
“Security controls: JWT with expiry and role checks, bcrypt PIN hashing, CORS/helmet configuration, and transactional writes for balances. Key risks: credential misuse, CORS misconfiguration, migration drift, and token theft if served without HTTPS. Mitigations: strong secrets, HTTPS, controlled origins, documented rollback commands, and planned future move to httpOnly/refresh tokens with rate limiting.”

## 14. Limitations
“Today there’s no CI/CD and no automated tests; verification is manual. Scope is single-store; there’s no multi-location or offline support. Tokens live in localStorage, and there are no refresh tokens yet. Analytics and advanced reporting are deferred.”

## 15. Future Work (Prioritized)
“Next steps: add CI with smoke tests; harden auth with refresh/httpOnly cookies and rate limiting; add structured logging and metrics; refactor into a service layer with tests; and expand to multi-location support and analytics/reporting.”

## 16. Evidence Appendix (Pointers)
“For proof, see backend routes, models, migrations, and the seeder; frontend services, pages, and AuthContext; command logs for Yarn install/build, db:migrate, db:seed, and docker compose; and curl outputs for core API flows. These anchors ensure every claim in the deck maps to the repository.”
