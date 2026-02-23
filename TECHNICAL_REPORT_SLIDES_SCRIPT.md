# Slide Deck Script — James Bakery Digital Loyalty System (Professor-Facing Recording)

Use this as a verbatim script for a recorded presentation to your professor. Read it word for word. Each slide opens with “why,” then “what,” then “how,” and ends with a short transition so the story stays connected.

## 1. Title & Context
“Hi Professor. In this recording I’ll walk you through the James Bakery Digital Loyalty System. We replaced paper punch cards with a secure, auditable digital flow. The stack is an Express TypeScript API on PostgreSQL, a React/Vite single-page app, and Dockerized Postgres for repeatable setup. Every statement I make here is backed by the code and command outputs I captured during development.”

## 2. Agenda
“Here’s the roadmap for this walkthrough: the problem and goals; the architecture and data model; the end-to-end UI journey; how we organized development; the testing evidence; the deployment runbook; risks and limitations; the forward roadmap; and finally where each claim maps back to the source files and logs I produced. I’ll keep transitions explicit so the narrative stays connected.”

## 3. Problem & Goals
“Paper punch cards were easily lost and impossible to audit, leading to balance disputes. Staff need fast, reliable lookup and redemption; the owner needs trustworthy balances. Our goals were secure staff login, phone-based lookup and creation, transactional earning and redemption, and admin controls without direct database access. Success means JWT-authenticated staff, normalized phone search, points awarded per configured rate, and rewards that can be toggled on or off—those are enforced directly in code.”

## 4. Architecture Overview
“Why this setup? We needed something staff could rely on without a heavy ops burden. What we built is two clear parts: a frontend and a backend. How it fits: the backend folder runs the Express server that handles all incoming API requests; PostgreSQL stores every loyalty record with relational integrity; the frontend is a React UI that staff actually click through; and Docker Postgres keeps local environments consistent. We chose a single monolith to stay simple for one store. Transition: now that the high-level shape is clear, let’s go deeper into the backend.”

## 5. Backend Highlights
“Why it matters: this is where correctness and trust live. What’s inside the backend folder: routes, models, migrations, and middleware. Routes are grouped by domain—auth, customers, transactions, redemptions, rewards, and admin. Middleware uses JWT to keep private routes protected and roles enforced. How we keep balances safe: earn and redeem run inside database transactions to prevent corruption; phone numbers are normalized and unique; admins can’t deactivate themselves. For example, when a purchase is made, the backend calculates points and updates the balance atomically so totals stay accurate. Transition: with the backend guardrails set, let’s look at what staff see on the frontend.”

## 6. Frontend Highlights
“Why the UI is shaped this way: speed and clarity at the counter. The frontend folder is a React app. Pages map to the screens staff use; services handle API calls; AuthContext stores the login token. Role-based navigation keeps admin panels visible only to managers. The main flow is Login, Home, Lookup/Create, then Purchase or Redemption, with admin panels for earn rate, rewards, and staff toggles. Transition: with the UI in mind, let’s talk about the data underneath.”

## 7. Database & Migrations
“Why Postgres? Reliability and strong relational integrity. What’s stored: customers, staff users, loyalty config for the earn rate, rewards, transactions, and redemptions. How it’s designed: UUIDs via pgcrypto avoid collisions; a single-row earn_rate table keeps configuration simple; migrations are ordered and timestamped so schema changes are deterministic; the seeder creates the admin, default rewards, and the starting earn rate. Example: a purchase transaction and its resulting balance change happen in one transaction so balances never drift. Transition: with the data foundation set, let’s see how the API and auth wrap it.”

## 8. API & Auth
“Why this flow: staff need to log in once and keep working quickly. What happens: `POST /v1/auth/login` with name and PIN returns a JWT; `GET /v1/auth/me` validates sessions. Public endpoints handle lookup and creation; admin endpoints handle configuration. How it works: the JWT is sent on each request so credentials aren’t re-entered. A real-life example: when staff logs in, they receive a token that lets them perform customer lookup, purchases, and redemptions without re-sending the PIN. Transition: now I’ll narrate the UI workflow as a real visit.”

## 9. UI Workflow (End-to-End)
“Picture a real customer visit. A staff member logs in and lands on Home with the right options for their role. They type a phone number—if we know the customer, we show their balance; if not, we create them on the spot. A purchase is entered, points are earned at the configured rate, and the balance updates immediately. If the customer wants a reward, staff select it; if points are short, the UI explains that cleanly. Admins can change the earn rate, manage rewards, or adjust staff status, all with guardrails. Logout clears the token. Transition: that’s the front-of-house flow; here’s how we built it.”

## 10. Development Process
“Why process matters: even solo, we kept professional discipline. We worked in epics—auth, customers, earning, redemption, admin, UI polish—delivering slice by slice. Branches followed feature-based naming, and yarn build was our fast validation before moving on. A traceability table links requirements to endpoints, UI components, and files so you can see coverage. Transition: with process in place, let’s cover how we proved it works.”

## 11. Testing & Evidence
“Why this validation: to prove the flows are real. Environment: Node 24.13, Corepack Yarn, Postgres 16 in Docker. We ran yarn build (backend and frontend), yarn db:migrate, yarn db:seed. Curl tests covered login, 404 on unknown customers, create customer success, purchase success, and a 409 when points are insufficient. In business terms: you can’t redeem what you don’t have. The Vite build output is ~67.5 kB gzipped for the main bundle, showing it stays lightweight. All logs and responses are captured in the appendix. Transition: here’s how to run it yourself.”

## 12. Deployment Runbook (Yarn + Docker)
“Why these steps: keep setup repeatable. Docker isolates Postgres. Backend must migrate before it starts so schema is ready. Frontend runs separately. Steps: docker compose up -d (DB on 5433); backend yarn install, set DATABASE_URL, JWT_SECRET, CORS_ORIGIN, then yarn db:migrate, yarn db:seed, yarn build && yarn start on port 4000; frontend yarn install, yarn dev or yarn build served on 5173. Success looks like migrations applied, seeds present, API live on 4000, UI live on 5173. Transition: with it running, let’s note the security posture.”

## 13. Security & Risk
“Why these controls: protect balances and access. What we do: hash PINs with bcrypt so stolen data is useless; JWTs expire and carry roles; CORS and helmet restrict who can call us; writes are transactional so balances stay consistent. Plain-language risks: wrong origins allowed, stale migrations, or tokens intercepted without HTTPS. Mitigations: strong secrets, HTTPS, restricted origins, rollback commands, and a plan for httpOnly refresh tokens with rate limiting. Transition: now I’ll call out conscious tradeoffs.”

## 14. Limitations
“These are intentional tradeoffs, not surprises. CI/CD and automated tests were deferred for timeline. Scope is single-store; tokens live in localStorage; no refresh tokens or offline support yet. Analytics and rich reporting are future phases. Transition: here’s how we’d mature it.”

## 15. Future Work (Prioritized)
“Near term: add CI with smoke tests, then harden auth with refresh and httpOnly cookies plus rate limiting. Next: structured logging and metrics, then a service layer with tests. Strategic: multi-location support and analytics/reporting. Transition: to close, here’s where to verify everything I’ve said.”

## 16. Evidence Appendix (Pointers)
“This exists so you can verify the claims academically. Backend: routes, models, migrations, seeder. Frontend: services, pages, AuthContext. Command logs: yarn install/build, db:migrate, db:seed, docker compose. API evidence: curl outputs for login, lookup, create, purchase, redemption. With that, the recorded walkthrough stays credible end to end.”
