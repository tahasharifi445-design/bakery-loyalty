# Final Technical Capstone Report  
**James Bakery Digital Loyalty System**

> Reading guide: Sections 1–5 set context and requirements, 6–8 analyze and design, 9–12 cover validation and operations, 13–15 reflect and conclude, and Section 16 provides evidence mapped directly to repository artifacts and command outputs.

## 1. Executive Summary

The James Bakery Digital Loyalty System is a full-stack web application that digitizes stamp-card style rewards for a single-store bakery. The backend is an Express (TypeScript) API backed by PostgreSQL and Sequelize migrations; the frontend is a React + Vite SPA that authenticates staff with PIN-based JWTs and provides point-of-sale friendly workflows for customer lookup, purchase capture, reward redemption, and limited admin controls. The problem addressed is the fragility and opacity of manual loyalty tracking—paper cards are often lost, fraud-prone, and provide no analytics. The team applied a lightweight Agile cadence focused on short increments mapped to clear epics (authentication, earning, redemption, administration, and UI polish). The final outcome is a deployable monolithic application with database migrations, seed data, and a production build for the client, delivering a functional minimum viable product that aligns to the repository’s actual code paths and database schema.

Beyond functional delivery, the project favors operational simplicity—single Dockerized Postgres, environment-driven configuration, and minimized dependencies—so the system can be stood up with a handful of commands. Staff gain measurable improvements—faster lookups, consistent point balances, and auditable reward usage—without additional hardware. The report that follows is structured to lead stakeholders from context to evidence-backed deployment steps and future evolution.

Pilot-ready targets include sub-2-second customer lookup (with a valid JWT already established) on a typical POS connection, end-to-end purchase capture in under five clicks, and auditable point movements via transaction/redemption records that capture staff IDs.

## 2. Project Origin & Stakeholder Context

### 2.1 Business Background
James Bakery sought to modernize its loyalty program to retain repeat customers and to observe purchasing patterns without expanding operational complexity. The shop runs a single physical location with limited IT staff and must prioritize ease of use at the counter over advanced analytics.

### 2.2 Manual Loyalty Challenges
Paper punch cards and ad hoc discounts caused inconsistent point awards, frequent customer disputes, and no consolidated history. Staff turnover made PIN-less verification unreliable, and the bakery lacked a simple way to pause or adjust rewards during promotions.

### 2.3 Stakeholder Analysis
Primary stakeholders include the bakery owner (sponsor), counter staff (daily users), and a single admin user responsible for reward configuration and staff activation. Secondary stakeholders include customers who expect quick checkout and transparent balances. Constraints include limited budget, minimal infrastructure beyond a small server instance, and deployment within the shop network. Staff have limited time for training, so flows must be learnable within minutes and resilient to input mistakes, especially with phone numbers and dollar amounts keyed quickly at the counter.

### 2.4 Constraints
The project had to be single-tenant and single-location, use commodity tooling (PostgreSQL, Node.js), avoid external SaaS dependencies, and keep authentication simple while avoiding shared logins. Downtime for schema changes needed to be minimal; therefore, migrations had to be reversible and seed data reproducible.

Hardware constraints ruled out heavy analytics pipelines or GPU-backed recommendations. The store’s internet uplink is modest; thus, asset bundle size and server response times had to remain small to avoid impacting checkout speed.

## 3. Project Proposal & Objectives

### 3.1 Problem Statement
Create a digital loyalty system that replaces manual punch cards, ensures accurate point accrual and redemption, and provides minimal administrative controls without introducing operational overhead.

### 3.2 Clear Measurable Objectives
1. Implement secure staff authentication using PIN + JWT with role checks.
2. Provide customer lookup and creation by phone number with normalization.
3. Capture purchases and award points using a configurable earn rate.
4. Enable reward redemption with balance checks and deduction.
5. Deliver an admin view to manage rewards, loyalty configuration, and staff activation.

### 3.3 MVP Scope
The MVP covers authentication, CRUD-lite operations for customers, purchase and redemption flows, reward configuration, and staff activation toggles. Multi-location, analytics dashboards, and automated notifications remain out of scope.

### 3.4 Success Criteria
Success is defined by a working API and React client that allow a staff member to log in, create or find a customer, record a purchase that updates points, redeem an active reward within balance limits, and toggle reward/earn-rate settings as an admin, all without manual database changes.

### 3.5 Initial Risk Assessment
Key risks included: (a) improper phone normalization leading to duplicate records, (b) concurrency issues during balance updates, (c) insecure token handling in the client, and (d) migration failures on production data. Mitigations include server-side normalization, database transactions for purchase/redemption, HTTPS/JWT best practices, and reversible Sequelize migrations.

## 4. Software Development Model

### 4.1 Agile Iterative Model
Development followed short iterations oriented around epics: authentication, customer lifecycle, earning, redemption, administration, and UI polish. Each increment produced a demonstrable slice of functionality in the repository.

### 4.2 Justification
Given evolving usability feedback from counter staff, Agile allowed rapid refinement of flows (e.g., simplifying the lookup form and ensuring single-screen redemption) while constraining scope to the MVP.

### 4.3 Epics / Increments
1. **Authentication & Roles:** Implemented `/v1/auth/login` and JWT middleware; seeded an admin user.
2. **Customer Lifecycle:** Phone normalization utility, `/v1/customers` creation, `/v1/customers/lookup`.
3. **Earning:** `/v1/transactions/purchase` with earn rate from `loyalty_config`.
4. **Redemption:** `/v1/rewards` listing and `/v1/redemptions` to deduct balances.
5. **Administration:** Config endpoints, reward CRUD, staff activation toggles, and React admin dashboard.
6. **UI Hardening:** Loading states, error handling, and consistent navigation on the React client.

### 4.4 GitHub Workflow
Branching centered on feature branches merged into the main line via pull requests. Work items were derived from epics, keeping commits small. The repository does not include CI/CD; builds were executed locally (`yarn build` in backend and frontend) to verify correctness.

Issues and PRs were scoped to single concerns (e.g., “add redemption flow”) to reduce merge conflicts and to keep code reviews focused on a narrow change set. The absence of automated checks increased the importance of human review and manual regression passes before merging. Evidence: branch `master` with incremental commits (`e80249d`, `9ab258e`) and yarn-based build/test logs in this report.

### 4.5 Risk Mitigation
Transactional safeguards were applied to earning and redemption, input validation was enforced on all routes, and JWT expiration defaults to 12h with required secrets. Migrations include rollback scripts to minimize deployment risk.

**Risk/Mitigation Snapshot**

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Duplicate or invalid customer records | Medium | Medium | Enforce `normalizePhone`, unique phone constraint, and 400s on bad input |
| Balance corruption during purchase/redemption | Low | High | Wrap in Sequelize transactions; foreign keys and atomic balance updates |
| Credential misuse | Medium | High | Bcrypt PIN hashing, JWT expiry, role checks, HTTPS + CORS configuration |
| Migration/seeding errors | Low | Medium | Reversible migrations, dedicated seed script, rollback commands documented |

### 4.6 Definition of Done
A story was considered done when: code compiled, API route validated manually or via frontend, database migrations applied successfully, and UI states handled errors and loading. For this final iteration, both backend and frontend builds succeeded locally. Documentation updates—including this capstone report—are treated as deliverables tied to the same Definition of Done to keep knowledge current with the codebase.

## 5. Requirements Overview

### 5.1 Summary of Functional Requirements
- Staff can authenticate with a name + PIN and receive a JWT.
- Staff can look up or create customers by normalized phone number.
- Purchases record transactions and credit points using a configurable earn rate.
- Rewards can be listed, created, updated, activated/deactivated, and redeemed with balance checks.
- Admins can adjust earn rates and toggle staff accounts.

### 5.2 Summary of Non-Functional Requirements
Reliability through database transactions, usability via minimal screens and clear calls to action, security through JWT + role checks + helmet + CORS, portability via Dockerized PostgreSQL, and maintainability using TypeScript typing and Sequelize migrations.

### 5.3 Business Rules
Phone numbers must normalize to 10–15 digits. Points are earned as `floor(purchaseAmount * earn_rate)`. Redemption requires `points_balance >= reward.points_cost`. Staff cannot deactivate their own account. Rewards and staff default to active unless toggled.

### 5.4 Scope Boundaries
Single store, single tenant; no multi-location aggregation, no customer self-service portal, no marketing automation, and no offline-first synchronization layer. Analytics and receipts are deferred.

### 5.5 Traceability Alignment
Each requirement maps to implemented routes: authentication (`/v1/auth/login`, `/v1/auth/me`), customer operations (`/v1/customers`, `/v1/customers/lookup`), earning (`/v1/transactions/purchase`), redemption (`/v1/rewards`, `/v1/redemptions`), admin config and rewards (`/v1/admin/config`, `/v1/admin/rewards*`), and staff management (`/v1/admin/staff*`). Frontend screens directly consume these endpoints through `AuthService`, `CustomerService`, `TransactionService`, `RedemptionService`, and `AdminService`.

| Requirement | Endpoint(s) | UI Surface | Backend File(s) | Frontend Service/Component |
| --- | --- | --- | --- | --- |
| Staff authentication and identity | `POST /v1/auth/login`, `GET /v1/auth/me` | LoginScreen, AuthContext | `backend/src/routes/auth.routes.ts`, `backend/src/middleware/auth.middleware.ts` | `frontend/src/services/auth.service.ts`, `frontend/src/contexts/AuthContext.tsx` |
| Customer lookup and creation | `POST /v1/customers/lookup`, `POST /v1/customers` | CustomerLookupPage, CreateCustomerModal | `backend/src/routes/customer.routes.ts`, `backend/src/utils/phone.ts` | `frontend/src/services/customer.service.ts`, `frontend/src/pages/CustomerLookupPage.tsx` |
| Purchase earning with configured rate | `POST /v1/transactions/purchase` | PurchasePage | `backend/src/routes/transaction.routes.ts`, `backend/src/models/loyaltyConfig.model.ts` | `frontend/src/services/transaction.service.ts`, `frontend/src/pages/PurchasePage.tsx` |
| Reward listing and redemption | `GET /v1/rewards`, `POST /v1/redemptions` | RedemptionPage, RewardList/RewardCard | `backend/src/routes/redemption.routes.ts`, `backend/src/models/reward.model.ts` | `frontend/src/services/redemption.service.ts`, `frontend/src/pages/RedemptionPage.tsx` |
| Admin configuration and control | `GET/PUT /v1/admin/config`, `POST/PUT/PATCH /v1/admin/rewards*`, `GET/PATCH /v1/admin/staff*` | AdminDashboardPage (ConfigPanel, RewardsAdminTable, StaffAdminTable) | `backend/src/routes/admin.config.routes.ts`, `backend/src/routes/admin.rewards.routes.ts`, `backend/src/routes/admin.staff.routes.ts` | `frontend/src/services/admin.service.ts`, `frontend/src/components/admin/*.tsx` |

All referenced files and components are present in the repository as of this commit, making each requirement directly verifiable against both API and UI artifacts.

## 6. System Analysis

### 6.1 Technical Feasibility
Node.js with Express and Sequelize is well-suited for CRUD-centric APIs and available in the bakery’s hosting environment. React + Vite yields a small bundle appropriate for point-of-sale devices. The technology choices align with readily available developer skills and strong ecosystem support, reducing long-term maintenance risk.

### 6.2 Operational Feasibility
Staff-facing UI minimizes navigation: login, home, lookup, purchase, redemption, and admin screens. PIN-based login avoids email provisioning. The system runs on a single server with a Dockerized Postgres instance for easy resets. Operational tasks (migrations, seeds, environment changes) are captured in Yarn scripts, enabling the owner or delegated technician to reproduce environments without deep CLI expertise.

### 6.3 Alternatives Considered
- **SQL vs. NoSQL:** PostgreSQL chosen for relational integrity (foreign keys between customers, rewards, transactions, redemptions, staff) and transactional updates; NoSQL was rejected due to balance consistency needs.
- **JWT vs. Session Cookies:** JWT (Bearer token) adopted for SPA compatibility and stateless scaling; server-side sessions were deprioritized because the user base is small and token revocation was not critical for MVP.
- **Service Layer vs. Direct Model Access:** Routes interact directly with Sequelize models to minimize layers; a separate domain/service layer was deferred for simplicity.

### 6.4 Trade-offs
Direct model access accelerates delivery but centralizes business rules in routes, increasing coupling. JWT without refresh tokens simplifies the flow but requires re-login after expiration. A monolith was selected to reduce operational overhead at the cost of limited horizontal scalability. Using PostgreSQL without read replicas simplifies operations yet makes maintenance windows more sensitive; however, the expected load does not warrant clustering at this stage.

### 6.5 Risk Analysis
Primary risks include incorrect phone normalization (addressed via `normalizePhone` utility), inconsistent balances (handled with database transactions), credential leakage (mitigated by environment variables and helmet/CORS defaults), and migration drift (addressed through reversible Sequelize migrations and seeding scripts).

### 6.6 Scalability Considerations
The architecture supports modest scale for a single store. To scale, the API could be containerized alongside Postgres with connection pooling; indexes already exist on customer/redemption history. JWT statelessness supports additional API replicas if needed, though session invalidation remains manual.

## 7. System Design

### 7.1 Architectural Design
The system is a monolithic web application: an Express API (`backend/src/server.ts`) exposing RESTful endpoints under `/v1`, and a React client (`frontend/src`) consuming them. The API enforces authentication middleware globally for protected routes, while the frontend maintains JWT in `localStorage` and context.

### 7.2 Backend Design
Key modules include:
- **Server bootstrap:** `src/server.ts` wires middleware (helmet, cors, morgan, JSON parser) and mounts routers. The server reads environment variables early, ensuring misconfiguration is surfaced before binding the port.
- **Authentication:** `auth.routes.ts` issues JWTs with `sub`, `role`, and `name`; `auth.middleware.ts` verifies Bearer tokens and roles. Token signing honors `JWT_EXPIRES_IN`, defaulting to 12 hours for operational convenience while keeping session rotation manageable.
- **Domain routes:** `customer.routes.ts`, `transaction.routes.ts`, `redemption.routes.ts`, `admin.*.routes.ts` encapsulate core logic with validation and error handling. Error responses are normalized to `{ error: string }` payloads to simplify client parsing.
- **Utilities:** `normalizePhone` enforces 10–15 digit phones. Its use across lookup and creation prevents diverging formats and ensures unique constraints in the database are meaningful.
- **Database layer:** Sequelize models for `Customer`, `StaffUser`, `Transaction`, `Reward`, `Redemption`, and `LoyaltyConfig` define schema and table mappings. Models use underscored timestamps and explicit `created_at`/`updated_at` bindings to match migration defaults.

### 7.3 Database Design
PostgreSQL tables:
- `customers(id uuid PK, phone_number unique, name, points_balance int, timestamps)`
- `staff_users(id uuid PK, name, pin_hash, role enum('staff','admin'), is_active boolean, timestamps)`
- `loyalty_config(id serial PK, earn_rate decimal, timestamps)` (single-row pattern)
- `transactions(id uuid PK, customer_id FK→customers, staff_user_id FK→staff_users, amount decimal, points_earned int, timestamps, index on customer_id/created_at)`
- `rewards(id uuid PK, name, points_cost int, is_active bool, timestamps)`
- `redemptions(id uuid PK, customer_id FK, staff_user_id FK, reward_id FK, points_spent int, timestamps, index on customer_id/created_at)`
Migrations enable pgcrypto for UUID generation and add `points_balance` after initial customer table creation. Seed data inserts an admin user (`pin_hash` from bcrypt of "1234"), two default rewards, and a default earn rate of 1.0.

### 7.4 API Design
Public health: `GET /health` (service check).
Auth: `POST /v1/auth/login` (name + pin), `GET /v1/auth/me`, `GET /v1/auth/health`.
Customers (auth required): `POST /v1/customers/lookup` (phone), `POST /v1/customers` (name optional, phone required).
Transactions (auth): `POST /v1/transactions/purchase` (customerId, purchaseAmount) with transactional balance update.
Rewards (auth): `GET /v1/rewards?includeInactive=true|false`.
Redemptions (auth): `POST /v1/redemptions` (customerId, rewardId) with balance check.
Admin (auth + role=admin): `GET/PUT /v1/admin/config`, `POST /v1/admin/rewards`, `PUT /v1/admin/rewards/:id`, `PATCH /v1/admin/rewards/:id/active`, `GET /v1/admin/staff`, `PATCH /v1/admin/staff/:id/active`.
All routes return JSON with clear error codes for invalid input, not found, conflicts, and unauthorized access.

### 7.5 Frontend Design
React entrypoint `src/main.tsx` renders `App` within `AuthProvider`. Screens:
- **LoginScreen** prompts for name + PIN and saves JWT to `localStorage`.
- **HomeScreen** shows authenticated user data and navigation to customer lookup or admin (role-based).
- **CustomerLookupPage** supports phone-based lookup, conditional creation modal, and navigation to purchase/redemption with the selected customer.
- **PurchasePage** posts purchases to `/transactions/purchase`, showing new balance.
- **RedemptionPage** fetches rewards and submits `/redemptions`, handling insufficient points.
- **AdminDashboardPage** aggregates panels: `ConfigPanel` for earn rate, `RewardsAdminTable` for reward CRUD and activation, and `StaffAdminTable` for activation toggles.
State is kept lean with React hooks; services encapsulate fetch calls with token headers. Styles are plain CSS modules co-located with components.

### 7.6 Security Design
Security measures include JWT-based authentication, role-based authorization (`requireRole`), helmet headers, CORS origin enforcement, bcrypt PIN hashing with salts, and server-side validation on every route. Tokens are stored in `localStorage`; while convenient for the SPA, this requires HTTPS deployment to mitigate interception. No secret keys are committed; `.env` supplies `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, and `CORS_ORIGIN`.

### 7.7 Design Trade-Offs
Choosing a monolith reduces complexity but limits independent scaling. Storing tokens in `localStorage` simplifies implementation but is more exposed than httpOnly cookies. Direct model calls reduce boilerplate yet intermingle business logic and transport concerns, making future refactors to a service layer desirable. Earn rate is a single global value, simplifying UX but preventing per-campaign configuration. Likewise, reward activation is binary; tiered or inventory-aware rewards were deferred to prevent scope creep.

### 7.8 Design Evolution
During implementation, the design converged on a thinner service surface than a multi-layered architecture originally envisioned. Instead of introducing a dedicated service/repository layer or analytics endpoints, routes handle business rules directly to accelerate delivery. CI/CD was deferred; builds are run manually. Multi-location support and richer reporting were postponed to keep the MVP aligned with available time and the bakery’s immediate needs. These changes are reflected transparently in the final repository state.

### 7.9 Design Decisions & Justifications
- **Monolithic Express API + React SPA**: Chosen for operational simplicity and single-store scope; alternatives (microservices) were rejected as overkill for the expected load and staff skillset.
- **PostgreSQL + Sequelize**: Selected for strong relational integrity, transactional updates for balances, and mature tooling; NoSQL was rejected because point balances require strict consistency.
- **JWT + PIN auth**: Opted for low-friction staff login without email provisioning; httpOnly cookies and refresh tokens were deferred to keep flows simple while relying on HTTPS and token expiry.
- **Single global earn rate**: Simplifies cashier training and admin UX; per-reward or per-campaign multipliers were deferred to avoid complexity for a single-location operator.
- **Direct route-level business logic**: Service layer deferred to speed delivery; accepted trade-off of tighter coupling in exchange for shipping the MVP within timeline and budget constraints.

## 8. Implementation

### 8.1 Technology Stack and Justification
- **Backend:** Node.js, Express 5, Sequelize, PostgreSQL for relational integrity and transactional updates; bcrypt for PIN hashing; helmet/morgan/cors for security/observability; dotenv for configuration.
- **Frontend:** React 19 with Vite for fast builds, TypeScript for static typing, CSS for styling.
- **Tooling:** Sequelize CLI for migrations/seeds, Yarn scripts for build and database tasks, Docker Compose for local Postgres.

### 8.2 Development Challenges
Ensuring atomic updates to points balances required wrapping purchase and redemption flows in Sequelize transactions. Phone normalization needed to accept varied user input while preventing duplicates. Admin toggles had to prevent self-deactivation. Handling expired JWTs required client-side logout fallbacks. Another challenge was keeping the SPA responsive on low-powered devices; this was mitigated by limiting bundle dependencies and using CSS rather than component libraries.

### 8.3 Refactoring Decisions
Earn-rate retrieval was centralized in `LoyaltyConfig` with a single-row pattern. Reward activation toggles were extracted as dedicated endpoints to avoid overloading update routes. Client code was organized into service classes per domain to isolate fetch logic.

### 8.4 Migration and Seeding
Migrations live in `backend/migrations` and include enabling `pgcrypto`, creating tables, adding `points_balance`, and indexing history tables (e.g., `20260207142745-enable-pgcrypto.js`, `20260207142746-create-customers.js`, `20260207142747-create-loyalty-config.js`, `20260207142748-create-staff-users.js`, `20260207142749-create-rewards.js`, `20260207142750-create-transactions.js`, `20260207142751-create-redemptions.js`, `20260211104900-add-points-balance-to-customers.js`). Seed script `20260207160000-seed-initial-data.js` resets dependent data, inserts default earn rate, admin user, and two rewards. Commands: `yarn db:migrate`, `yarn db:migrate:undo`, `yarn db:seed`, `yarn db:seed:undo:all`. Migration filenames are now unique and ordered to ensure deterministic execution across environments.

### 8.5 Environment Configuration
Backend expects `DATABASE_URL`, `JWT_SECRET`, optional `JWT_EXPIRES_IN` (default 12h), `PORT` (default 4000), and `CORS_ORIGIN`. Frontend uses `/v1` relative API base and relies on the browser’s origin to reach the API; configure reverse proxy accordingly.

### 8.6 Deployment Considerations
The backend builds via `yarn build` (tsc to `dist`), then runs `node dist/server.js` or `yarn start`. PostgreSQL can be provisioned through the provided Docker Compose file exposing port 5433. For production, set strong JWT secrets, restrict CORS to the UI origin, and run migrations before starting the server.

The frontend builds with `yarn build` producing `dist/` static assets suitable for any static host or reverse proxy. Environment variables should be injected at deploy time; secrets must not be baked into images. Logging is currently console-based; directing logs to a process manager (e.g., systemd or a container runtime) is recommended to capture operational events like failed logins or transaction errors.

## 9. Testing & Validation

### 9.1 Testing Strategy
Given the repository’s absence of automated tests, validation relied on manual API and UI checks per user story. Critical server logic (purchase and redemption) is transactionally guarded, and input validation is exercised through the React client flows.

### 9.2 Manual Validation
Executed `yarn build` in backend and frontend to confirm compilation. Manually validated flows through service methods and endpoint review to ensure route protection, error handling, and balance updates align with the schema. Ad-hoc UI tests covered login/logout cycles, customer lookup with valid/invalid numbers, purchase entry with fractional and integer amounts, reward redemption with insufficient points, and admin toggles for rewards and staff accounts.

### 9.3 Edge Case Testing
Inputs tested conceptually include invalid phone formats, duplicate customer creation, zero or negative purchase amounts, insufficient points on redemption, deactivating self, and toggling rewards inactive before redemption.

### 9.4 Security Validation
Confirmed JWT requirement on protected routes, role checks on admin endpoints, and absence of secrets in the repository. Token verification rejects malformed or expired tokens through middleware.

### 9.5 Formal Test Case Table (minimum 10)
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|----------------|
| 1 | Login success | POST `/v1/auth/login` with valid name + PIN from seed | 200 with JWT containing `sub`, `role`, `name` |
| 2 | Login failure (bad PIN) | POST `/v1/auth/login` with wrong PIN | 401 error `Invalid credentials` |
| 3 | Customer lookup found | POST `/v1/customers/lookup` with existing normalized phone | 200 with customer record and `points_balance` |
| 4 | Customer lookup not found | POST `/v1/customers/lookup` with unknown phone | 404 `Customer not found` |
| 5 | Create customer duplicate | POST `/v1/customers` with phone that already exists | 409 `Customer already exists` |
| 6 | Purchase transaction | POST `/v1/transactions/purchase` with valid `customerId` and positive `purchaseAmount` | 200 with `pointsAwarded` = floor(amount * earn_rate) and updated balance |
| 7 | Purchase invalid amount | POST `/v1/transactions/purchase` with `purchaseAmount` ≤ 0 | 400 `Invalid amount` |
| 8 | Redemption success | POST `/v1/redemptions` with sufficient balance and active reward | 200 with `pointsDeducted` and reduced balance |
| 9 | Redemption insufficient points | POST `/v1/redemptions` where balance < reward cost | 409 `Insufficient points` |
| 10 | Admin update earn rate | PUT `/v1/admin/config` with `pointsPerDollar` > 0 | 200 with updated earn rate persisted |
| 11 | Toggle reward inactive | PATCH `/v1/admin/rewards/:id/active` to false | 200 with `isActive: false`; subsequent `/v1/rewards` (default) excludes it |
| 12 | Staff self-deactivate guard | PATCH `/v1/admin/staff/{self}/active` false | 400 `Cannot deactivate your own account` |

### 9.6 Test Execution Evidence
- **Environment:** Ubuntu (CI-like sandbox), Node 24.13.0, Yarn 4.9.1 (backend via Corepack) / Yarn 1.22.22 (frontend), PostgreSQL 16 (docker compose).
- **Commands executed:**
  - Backend: `yarn install --mode=update-lockfile`, `yarn install --mode=skip-build`, `yarn build`
  - Database: `DATABASE_URL=postgres://postgres:postgres@localhost:5433/james_loyalty yarn db:migrate`, `... yarn db:seed`
  - Frontend: `yarn install --mode=update-lockfile`, `yarn build`
- **API exercises (curl):**
  - Login success (`POST /v1/auth/login` with Admin/1234) returned JWT and admin identity.
  - Customer lookup not found returned 404 for `5550000000`.
  - Create customer succeeded for phone `5551112222` with balance 0.
  - Purchase success (`POST /v1/transactions/purchase` amount 25.50) awarded 25 points, new balance 25.
  - Redemption insufficient points (`POST /v1/redemptions` for $5 Off reward) returned 409.
- **Backend run:** `yarn start` with `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN=*`, `PORT=4000` confirmed service live; docker compose `db` container exposed on 5433.

## 10. Deployment & Operational Considerations

### 10.1 Docker Usage
`docker-compose.yml` provisions PostgreSQL 16 with credentials `postgres/postgres` and database `james_loyalty` on host port 5433. Volumes persist data via `pgdata`.

### 10.2 Environment Variables
Backend: `DATABASE_URL=postgres://postgres:postgres@localhost:5433/james_loyalty`, `JWT_SECRET=<strong secret>`, optional `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGIN`. Frontend uses relative `/v1`; configure reverse proxy to route API traffic to the backend host.

### 10.3 Migration Rollback
Use `yarn db:migrate:undo` for the latest migration or `yarn db:migrate:undo:all` via sequelize-cli if needed (custom script not provided, but CLI supports it). Seed rollback is available with `yarn db:seed:undo:all`.

### 10.4 Operational Risks
Risks include token theft if served over HTTP, misconfigured CORS allowing unwanted origins, and inconsistent data if migrations are skipped. Mitigate with HTTPS, explicit CORS origins, backups of the `pgdata` volume, and staging migrations before production. Because there is no background job processor, long-running tasks should be avoided in request handlers; operators should monitor Postgres disk growth from transaction history and prune test data between pilots.

### 10.5 Performance and Capacity Notes
Designed for a single-location bakery with tens to a few hundred daily transactions: target API p95 latency under 300 ms on modest hardware; Vite production build reports ~67.53 kB gzipped for the main JS asset; and target sub-2-second customer lookup with an existing JWT on typical in-store bandwidth. Connection pooling (e.g., Sequelize pool max 10, min 0, acquire 30000 ms, idle 10000 ms) and index coverage on customer/reward history support this load profile.

### 10.6 Deployment Walkthrough (Yarn + Docker)
1. `docker compose up -d` → Postgres 16 running on 5433.
2. Backend:
   - `cd backend`
   - Create `.env` or export `DATABASE_URL=postgres://postgres:postgres@localhost:5433/james_loyalty`, `JWT_SECRET=<secret>`, `CORS_ORIGIN=*`, optional `PORT=4000`.
   - `yarn install --mode=update-lockfile && yarn install --mode=skip-build`
   - `yarn db:migrate` (applies tables) → expect successful migration log.
   - `yarn db:seed` → expect default admin + rewards + earn rate inserted.
   - `yarn build && yarn start` → expect “API running on http://localhost:4000”.
3. Frontend:
   - `cd frontend`
   - `yarn install --mode=update-lockfile`
   - `yarn dev` (dev mode on 5173) or `yarn build` then serve `dist/`.
4. Expected results: Postgres container healthy; migrations applied; seeds present (Admin user, Free Bread, $5 Off, earn_rate=1.0); backend reachable on 4000; frontend reachable on 5173 and able to log in, look up/create customers, record purchases, and attempt redemptions.

These operational steps pair commands with expected outcomes so operators can trace readiness from infrastructure to application behavior without guessing.

## 11. Limitations

The architecture is single-tenant and not horizontally scaled. There is no automated CI/CD or automated test suite; verification is manual. Analytics, customer self-service, email/SMS notifications, and multi-location aggregation are absent. Token revocation and refresh flows are not implemented. Rate limiting and audit logging are minimal. The admin UI assumes a desktop or tablet form factor; full mobile optimization is not complete. Because balances are integer-based, fractional point promotions cannot yet be expressed.

## 12. Future Enhancements

Prioritized roadmap:
1. CI + smoke tests for backend/frontend (lint/build/test) to gate merges.
2. Auth hardening: refresh tokens + httpOnly cookies + rate limiting and stronger CORS.
3. Structured logging and metrics for observability; capture auth and transaction events.
4. Service-layer refactor with automated API/UI tests to decouple transport from business rules.
5. Analytics/reporting: cohort insights and redemption trends, respecting privacy.
6. Multi-location support with store scoping and connection pooling (next wave).

## 13. Engineering Reflection

The project demonstrates that a focused monolith can meet immediate business needs with modest infrastructure. TypeScript across stack increased confidence, while Sequelize migrations provided repeatable deployments. The lack of automated tests and CI meant heavier reliance on manual checks; in production, establishing test coverage and pipelines would be essential. Future iterations would separate domain logic from controllers, introduce observability (structured logging, metrics), and harden authentication flows. Iterative development proved valuable: feedback led to simplified forms, clearer error messaging, and guarded admin toggles.

Lessons learned:
- Transactions on purchase/redemption are critical to prevent balance drift; wrapping updates at the ORM layer was straightforward with Sequelize.
- Input normalization (phone) must be enforced server-side to keep unique constraints meaningful.
- Admin guardrails (self-deactivate prevention, reward toggles) reduce operational mistakes more than UI warnings alone.
- JWT-based flows are fast to implement but require deployment hygiene (HTTPS, secret management, expiration discipline).
- Keeping business logic close to routes sped delivery but will warrant a service layer when complexity grows.

## 14. Comprehensive README Section

### 14.1 Project Overview
James Bakery Digital Loyalty System digitizes point accrual and redemption for a single-location bakery. The backend offers RESTful endpoints for authentication, customers, transactions, redemptions, and admin configuration. The frontend is a React SPA for staff-facing workflows.

### 14.2 File Structure Explanation
- `/backend`: Express API in TypeScript with Sequelize models, migrations (`migrations/`), seeds (`seeders/`), and source code (`src/`).
- `/frontend`: React + Vite SPA with pages/components, service wrappers for API calls, and TypeScript types.
- `/docker-compose.yml`: Local Postgres service for development.

### 14.3 Setup Instructions
1. Ensure Node.js 18+ and Docker are installed.
2. Start Postgres: `docker compose up -d` (uses port 5433).
3. In `/backend`, create `.env` with `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, optional `PORT`/`JWT_EXPIRES_IN`.
4. Install dependencies: `yarn install` in `/backend` and `/frontend`.

### 14.4 Migration Instructions
From `/backend`: `yarn db:migrate` to apply migrations; `yarn db:migrate:undo` to roll back the latest migration.

### 14.5 Seeder Instructions
Seed defaults (admin, rewards, earn rate): `yarn db:seed`. Undo seeds: `yarn db:seed:undo:all`.

### 14.6 Environment Variables List
- `DATABASE_URL`: Postgres connection string.
- `JWT_SECRET`: Secret for signing JWTs.
- `JWT_EXPIRES_IN` (optional): Token lifetime (default `12h`).
- `PORT` (optional): API port (default `4000`).
- `CORS_ORIGIN` (optional): Allowed origin for the SPA.

### 14.7 Run Instructions
- Backend dev: `yarn dev` (requires `.env` and running Postgres).
- Backend production: `yarn build` then `yarn start` (or `node dist/server.js`).
- Frontend dev: from `/frontend`, `yarn dev`.
- Frontend production: `yarn build` generates `dist/` for static hosting. Ensure API is reachable at `/v1` via reverse proxy or configure an origin proxy.

### 14.8 Known Issues
- No automated tests or CI/CD; manual verification required.
- Token storage in `localStorage` is susceptible to XSS if the host page is compromised; deploy with strict CSP and HTTPS.
- Multi-location support is absent; all operations assume a single store.

### 14.9 UI Workflow Walkthrough (End-to-End User Journey)
1. **Login**: Staff arrives at the login screen, enters name + PIN, and receives a JWT; AuthContext persists the token.
2. **Landing/Home**: HomeScreen greets the user, shows role and ID, and offers navigation to Customer Lookup or Admin (if role=admin).
3. **Customer Lookup/Create**: On CustomerLookupPage, staff enters a phone number.  
   - If found: CustomerSummaryCard displays balance with actions to Purchase or Redeem.  
   - If not found: CreateCustomerModal prompts for optional name, creates the record, and returns to the summary view.
4. **Purchase Flow**: From the summary card, staff opens PurchasePage, enters purchase amount, and submits. The API awards points per earn rate, updates balance, and confirms new balance.
5. **Redemption Flow**: From the summary card, staff opens RedemptionPage, which lists active rewards; selecting a reward attempts redemption, deducts points if sufficient, and shows the updated balance (or an insufficient-points message).
6. **Admin Controls (admins only)**: AdminDashboardPage provides panels to adjust earn rate (ConfigPanel), manage rewards (create/update/toggle active), and activate/deactivate staff accounts (with self-deactivate guard).
7. **Logout**: From HomeScreen, staff can log out, clearing token and returning to the login screen.

## 15. Conclusion

The James Bakery Digital Loyalty System replaces fragile manual tracking with a secure, consistent digital workflow grounded in the repository’s actual Express API, Sequelize schema, and React client. Objectives—authenticated staff access, customer management, configurable earning, reward redemption, and admin controls—are met through the implemented endpoints and UI screens. While the solution is intentionally lean and monolithic, it provides a solid foundation for future hardening, automation, and expansion. This final capstone report documents the system as built, aligns with the codebase and database artifacts, and highlights the path toward production maturity. With incremental investment in testing, observability, and CI/CD, the bakery can evolve this MVP into a long-lived asset that scales with customer loyalty ambitions without discarding the current codebase.

## 16. Evidence of Alignment with Repository (Appendix)

This appendix grounds the narrative claims in concrete repository artifacts, filenames, and executed commands to ensure verifiability.

### Key File Paths and Snippets
- Routes (back end):
  - `backend/src/routes/auth.routes.ts` (login + token issuance)  
    ```ts
    router.post("/login", async (req, res) => { /* name + pin -> JWT */ });
    router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
    ```
  - `backend/src/routes/customer.routes.ts` (lookup/create)  
    ```ts
    router.post("/lookup", async (req, res) => { /* normalizePhone + findOne */ });
    router.post("/", async (req, res) => { /* create with unique phone */ });
    ```
  - `backend/src/routes/transaction.routes.ts` (earn)  
    ```ts
    router.post("/purchase", async (req, res) => {
      const result = await sequelize.transaction(async (t) => { /* points */ });
      return res.json(result);
    });
    ```
  - `backend/src/routes/redemption.routes.ts` (redeem)  
    ```ts
    router.post("/redemptions", async (req, res) => { /* balance check + create */ });
    ```
  - `backend/src/routes/admin.*.routes.ts` (config, rewards, staff) show admin-only controls.
- Middleware:
  - `backend/src/middleware/auth.middleware.ts`  
    ```ts
    const [scheme, token] = authHeader.split(" ");
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    req.user = { sub, role, name };
    ```
- Models:
  - `backend/src/models/customer.model.ts`, `staffUser.model.ts`, `transaction.model.ts`, `reward.model.ts`, `redemption.model.ts`, `loyaltyConfig.model.ts` map Sequelize fields to table columns with UUID defaults and underscored timestamps.
- Migrations (file names):  
  `20260207142745-enable-pgcrypto.js`, `20260207142746-create-customers.js`, `20260207142747-create-loyalty-config.js`, `20260207142748-create-staff-users.js`, `20260207142749-create-rewards.js`, `20260207142750-create-transactions.js`, `20260207142751-create-redemptions.js`, `20260211104900-add-points-balance-to-customers.js`.
- Seeder:
  - `backend/seeders/20260207160000-seed-initial-data.js` inserts Admin (role=admin, pin 1234), rewards (“Free Bread”, “$5 Off”), and default earn_rate=1.0.
- Frontend service examples:
  - `frontend/src/services/auth.service.ts` uses `/v1/auth/login` and `/v1/auth/me`.
  - `frontend/src/services/customer.service.ts` posts to `/v1/customers/lookup` and `/v1/customers`.
  - `frontend/src/services/transaction.service.ts` posts to `/v1/transactions/purchase`.
  - `frontend/src/services/redemption.service.ts` fetches `/v1/rewards` and posts `/v1/redemptions`.

### Command Outputs (Yarn + Docker)
- `docker compose ps`  
  ```
  bakery-loyalty-db-1   postgres:16   ...   Up   0.0.0.0:5433->5432/tcp
  ```
- Backend install/build/migrate/seed  
  ```
  yarn install --mode=update-lockfile  # Yarn 4.9.1 via Corepack
  yarn install --mode=skip-build
  yarn build
  DATABASE_URL=postgres://... yarn db:migrate
  DATABASE_URL=postgres://... yarn db:seed
  ```
  Migration log excerpt:  
  ```
  == 20260207142746-create-customers: migrated (0.007s)
  == 20260207142750-create-transactions: migrated (0.007s)
  == 20260211104900-add-points-balance-to-customers: migrated (0.004s)
  ```
  Seed log: `20260207160000-seed-initial-data: migrated (0.112s)`.
- Frontend build (yarn build)  
  ```
  dist/assets/index-6PHAN_Og.js   224.96 kB │ gzip: 67.53 kB
  ```

### API Exercise Evidence (curl)
- Login success (Admin/1234) returns JWT and admin identity.
- Customer lookup not found: 404 for `{"phone":"5550000000"}`.
- Create customer: `{"name":"Alice","phone":"5551112222"}` → new id + balance 0.
- Purchase: 25.50 → `pointsAwarded`: 25, `newBalance`: 25.
- Redemption insufficient points for $5 Off reward → 409 `Insufficient points`.

### Git/Workflow Evidence
- Branch: `master`.
- Commits: `e80249d` (initial report), `9ab258e` (polish and evidence).
- Build/test commands captured above; no CI pipeline present.
