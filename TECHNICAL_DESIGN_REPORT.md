# TECHNICAL DESIGN REPORT
# Bakery Loyalty System

---

## 1️⃣ ARCHITECTURAL STRUCTURE

### Architecture Pattern
- **Client-Server Architecture** with clear separation between frontend (client) and backend (API server)
- **Three-tier architecture**: Presentation layer (React), Business logic layer (Express), Data layer (PostgreSQL)
- **RESTful API** design pattern

### Backend Structure
- **Monolithic backend** with modular routing structure
- TypeScript-based Node.js application
- Express.js framework

### Layer Separation
- **Presentation Layer**: React frontend (`/frontend/src`)
- **Business Logic Layer**: Express routes and middleware (`/backend/src/routes`, `/backend/src/middleware`)
- **Data Access Layer**: Sequelize ORM models (`/backend/src/models`)
- **Database Layer**: PostgreSQL with Sequelize migrations

### Component Boundaries
- Backend components:
  - Server entry point (`src/server.ts`)
  - Authentication middleware (`src/middleware/auth.middleware.ts`)
  - Route modules (separate files per domain)
  - Database models (one file per entity)
  - Utility functions (`src/utils/phone.ts`)
  - Database connection (`src/db/index.ts`)
  
- Frontend components:
  - Application entry (`src/main.tsx`, `src/App.tsx`)
  - Authentication context provider (`src/contexts/AuthContext.tsx`)
  - Service layer for API calls (`src/services/`)
  - UI components (`src/components/`)
  - Page components (`src/pages/`)
  - Type definitions (`src/types/`)

### Separation of Concerns
- **Routes**: Handle HTTP requests/responses
- **Models**: Define data structure and ORM mappings
- **Middleware**: Authentication and authorization
- **Services** (frontend): API communication abstraction
- **Contexts** (frontend): Global state management
- **Utils**: Shared utility functions

---

## 2️⃣ BACKEND DESIGN STRUCTURE

### Full Folder Hierarchy
```
backend/
├── config/
│   └── config.js                          # Sequelize database configuration
├── migrations/
│   ├── 20260207142745-enable-pgcrypto.js
│   ├── 20260207142745-create-customers.js
│   ├── 20260207142746-create-staff-users.js
│   ├── 20260207142746-create-loyalty-config.js
│   ├── 20260207142747-create-transactions.js
│   ├── 20260207142747-create-rewards.js
│   ├── 20260207142748-create-redemptions.js
│   └── 20260211104900-add-points-balance-to-customers.js
├── models/
│   └── index.js                           # Sequelize-CLI generated file
├── seeders/
│   └── 20260207160000-seed-initial-data.js
├── src/
│   ├── db/
│   │   └── index.ts                       # Database connection and authentication
│   ├── middleware/
│   │   └── auth.middleware.ts             # JWT authentication and role-based authorization
│   ├── models/
│   │   ├── customer.model.ts
│   │   ├── loyaltyConfig.model.ts
│   │   ├── redemption.model.ts
│   │   ├── reward.model.ts
│   │   ├── staffUser.model.ts
│   │   └── transaction.model.ts
│   ├── routes/
│   │   ├── admin.config.routes.ts
│   │   ├── admin.rewards.routes.ts
│   │   ├── admin.staff.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── customer.routes.ts
│   │   ├── redemption.routes.ts
│   │   └── transaction.routes.ts
│   ├── types/
│   │   └── express.d.ts                   # TypeScript type extensions
│   ├── utils/
│   │   └── phone.ts                       # Phone number normalization utility
│   └── server.ts                          # Application entry point
├── package.json
├── tsconfig.json
└── README.md
```

### Route Modules and Endpoint Grouping

**Authentication Routes** (`auth.routes.ts`):
- `/v1/auth/login` - Staff authentication
- `/v1/auth/me` - Get current user
- `/v1/auth/health` - Health check

**Customer Routes** (`customer.routes.ts`):
- `/v1/customers/lookup` - Lookup customer by phone
- `/v1/customers` - Create new customer

**Transaction Routes** (`transaction.routes.ts`):
- `/v1/transactions/purchase` - Record purchase transaction

**Redemption Routes** (`redemption.routes.ts`):
- `/v1/rewards` - List active rewards
- `/v1/redemptions` - Create redemption

**Admin Config Routes** (`admin.config.routes.ts`):
- `/v1/admin/config` - GET loyalty configuration
- `/v1/admin/config` - PUT update configuration

**Admin Rewards Routes** (`admin.rewards.routes.ts`):
- `/v1/admin/rewards` - POST create reward
- `/v1/admin/rewards/:id` - PUT update reward
- `/v1/admin/rewards/:id/active` - PATCH toggle reward status

**Admin Staff Routes** (`admin.staff.routes.ts`):
- `/v1/admin/staff` - GET list staff users
- `/v1/admin/staff/:id/active` - PATCH toggle staff status

### Middleware Components and Execution Order

**Global Middleware (server.ts) - Execution Order**:
1. `helmet()` - Security headers
2. `cors({ origin: process.env.CORS_ORIGIN ?? "*" })` - CORS configuration
3. `express.json({ limit: "1mb" })` - JSON body parser with size limit
4. `morgan("dev")` - HTTP request logging

**Route-Level Middleware**:
- `requireAuth` - JWT token validation (applied to protected routes)
- `requireRole(["admin"])` - Role-based access control (applied to admin routes)

**Middleware Chain Examples**:
- Public: `/v1/auth/login` → No middleware
- Authenticated: `/v1/customers` → `requireAuth`
- Admin only: `/v1/admin/*` → `requireAuth` → `requireRole(["admin"])`

### Service/Business Logic Layers
- **No explicit service layer** - Business logic embedded in route handlers
- **Transaction logic** embedded in route handlers with Sequelize transactions
- **Validation logic** inline in route handlers

### Utility/Helper Modules
- `src/utils/phone.ts`:
  - `normalizePhone(input: string)`: Strips non-digits, validates 10-15 digit length
  - Throws error for invalid format

### Validation Layer Location
- **Inline validation** in route handlers
- Type checking: `typeof` checks for request body parameters
- Business validation: Direct validation in route logic
- Examples:
  - PIN format validation: `/^\d{4,10}$/` regex
  - Phone validation: `normalizePhone()` utility
  - Amount validation: `purchaseAmount <= 0` check
  - Points validation: `pointsPerDollar <= 0 || pointsPerDollar > 1000`

### Error Handling Mechanism
- **No centralized error middleware**
- **Try-catch blocks** in individual route handlers
- **Console.error** for error logging
- **Custom error messages** with specific error types
- Error response pattern: `res.status(code).json({ error: "message" })`
- Specific error handling:
  - Custom Error types: `CUSTOMER_NOT_FOUND`, `REWARD_NOT_FOUND`, `INSUFFICIENT_POINTS`, `LOYALTY_CONFIG_NOT_FOUND`
  - Database errors caught and logged
  - JWT verification errors caught silently

### Authentication Flow (Step-by-Step)

**Login Flow** (`POST /v1/auth/login`):
1. Extract `name` and `pin` from request body
2. Validate input types (`typeof` checks)
3. Normalize name (`trim()` and validate non-empty)
4. Validate PIN format (`/^\d{4,10}$/` regex)
5. Query database using case-insensitive name match (`Sequelize.fn("lower")`)
6. Return 401 if user not found
7. Check `is_active` flag (403 if inactive)
8. Compare PIN with hashed PIN using `bcrypt.compare()`
9. Return 401 if PIN doesn't match
10. Generate JWT with `jwt.sign()`:
    - Payload: `{ sub: staffUser.id, role: staffUser.role, name: staffUser.name }`
    - Secret: `process.env.JWT_SECRET`
    - Expiration: `process.env.JWT_EXPIRES_IN ?? "12h"`
11. Return token and user data

**Authentication Verification** (`requireAuth` middleware):
1. Extract `Authorization` header
2. Return 401 if header missing
3. Split header into scheme and token (`authHeader.split(" ")`)
4. Validate scheme is "Bearer" (case-insensitive)
5. Return 401 if scheme invalid or token missing
6. Verify JWT using `jwt.verify(token, jwtSecret)`
7. Extract `sub`, `role`, `name` from payload
8. Validate required fields present and role valid
9. Return 401 if validation fails
10. Attach `req.user` object with parsed data
11. Call `next()` to proceed

### Role-Based Access Enforcement Implementation
- **requireRole Middleware** (`src/middleware/auth.middleware.ts`):
  - Higher-order function accepting array of roles
  - Returns middleware function
  - Checks `req.user.role` against allowed roles array
  - Returns 403 Forbidden if role not in allowed list
  - Calls `next()` if authorized

**Role Application**:
- Admin routes: `requireAuth, requireRole(["admin"])`
- Two roles: `"staff"` and `"admin"`
- Role validation: `isValidRole()` type guard function

### Transaction Management Implementation

**Sequelize Transaction Pattern**:
```typescript
const result = await sequelize.transaction(async (t) => {
  // All database operations use { transaction: t }
  const customer = await Customer.findByPk(customerId, { transaction: t });
  await Transaction.create({...}, { transaction: t });
  await customer.update({...}, { transaction: t });
  return result;
});
```

**Atomic Operations**:
- Purchase transaction (`POST /v1/transactions/purchase`):
  1. Begin Sequelize transaction
  2. Fetch customer (with transaction lock)
  3. Fetch loyalty config (with transaction lock)
  4. Calculate points
  5. Create transaction record (within transaction)
  6. Update customer points balance (within transaction)
  7. Commit if all succeed, rollback if any fail

- Redemption transaction (`POST /v1/redemptions`):
  1. Begin Sequelize transaction
  2. Fetch customer (with transaction lock)
  3. Fetch reward (with transaction lock)
  4. Validate sufficient points
  5. Create redemption record (within transaction)
  6. Update customer points balance (within transaction)
  7. Commit if all succeed, rollback if any fail

**Locking**: Default transaction isolation level (READ COMMITTED)

### Data Consistency Mechanisms
- **Database transactions** for atomic updates
- **Foreign key constraints** enforce referential integrity
- **Unique constraints** on phone numbers
- **NOT NULL constraints** on required fields
- **Point balance** updated atomically within transactions
- **Optimistic concurrency** via Sequelize timestamps (`updated_at`)

### Logging Implementation
- **Morgan** HTTP request logging (dev format)
- **Console logging**:
  - `console.log()` for server startup
  - `console.error()` for error logging with descriptive messages
- No structured logging framework
- No log levels beyond console methods

---

## 3️⃣ DATABASE DESIGN

### Complete Entity List
1. `customers`
2. `staff_users`
3. `loyalty_config`
4. `rewards`
5. `transactions`
6. `redemptions`

### Field Definitions

#### customers
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| phone_number | STRING(20) | NOT NULL, UNIQUE |
| name | STRING(100) | NULL |
| points_balance | INTEGER | NOT NULL, DEFAULT 0 |
| created_at | DATE | NOT NULL, DEFAULT NOW() |
| updated_at | DATE | NOT NULL, DEFAULT NOW() |

#### staff_users
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | STRING(100) | NOT NULL |
| pin_hash | STRING(255) | NOT NULL |
| role | ENUM('staff', 'admin') | NOT NULL, DEFAULT 'staff' |
| is_active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | DATE | NOT NULL, DEFAULT NOW() |
| updated_at | DATE | NOT NULL, DEFAULT NOW() |

#### loyalty_config
| Field | Type | Constraints |
|-------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT |
| earn_rate | DECIMAL(10, 4) | NOT NULL, DEFAULT 1.0 |
| created_at | DATE | NOT NULL, DEFAULT NOW() |
| updated_at | DATE | NOT NULL, DEFAULT NOW() |

#### rewards
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | STRING(120) | NOT NULL |
| points_cost | INTEGER | NOT NULL |
| is_active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | DATE | NOT NULL, DEFAULT NOW() |
| updated_at | DATE | NOT NULL, DEFAULT NOW() |

#### transactions
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| customer_id | UUID | NOT NULL, FOREIGN KEY → customers(id) |
| staff_user_id | UUID | NOT NULL, FOREIGN KEY → staff_users(id) |
| amount | DECIMAL(10, 2) | NOT NULL |
| points_earned | INTEGER | NOT NULL |
| created_at | DATE | NOT NULL, DEFAULT NOW() |
| updated_at | DATE | NOT NULL, DEFAULT NOW() |

#### redemptions
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| customer_id | UUID | NOT NULL, FOREIGN KEY → customers(id) |
| staff_user_id | UUID | NOT NULL, FOREIGN KEY → staff_users(id) |
| reward_id | UUID | NOT NULL, FOREIGN KEY → rewards(id) |
| points_spent | INTEGER | NOT NULL |
| created_at | DATE | NOT NULL, DEFAULT NOW() |
| updated_at | DATE | NOT NULL, DEFAULT NOW() |

### Primary Keys
- `customers.id`: UUID (generated via gen_random_uuid())
- `staff_users.id`: UUID (generated via gen_random_uuid())
- `loyalty_config.id`: INTEGER (auto-increment)
- `rewards.id`: UUID (generated via gen_random_uuid())
- `transactions.id`: UUID (generated via gen_random_uuid())
- `redemptions.id`: UUID (generated via gen_random_uuid())

### Foreign Keys

**transactions table**:
- `customer_id` → `customers.id`
- `staff_user_id` → `staff_users.id`

**redemptions table**:
- `customer_id` → `customers.id`
- `staff_user_id` → `staff_users.id`
- `reward_id` → `rewards.id`

### Referential Constraints

**transactions**:
- `customer_id`: onDelete: RESTRICT, onUpdate: CASCADE
- `staff_user_id`: onDelete: RESTRICT, onUpdate: CASCADE

**redemptions**:
- `customer_id`: onDelete: RESTRICT, onUpdate: CASCADE
- `staff_user_id`: onDelete: RESTRICT, onUpdate: CASCADE
- `reward_id`: onDelete: RESTRICT, onUpdate: CASCADE

### Unique Constraints
- `customers.phone_number`: UNIQUE

### Indexes
- `transactions`: Composite index on `(customer_id, created_at)`
- `redemptions`: Composite index on `(customer_id, created_at)`

### UUID Generation Method
- **PostgreSQL pgcrypto extension**: `gen_random_uuid()` function
- Extension enabled via migration: `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`
- UUID format: Version 4 (random)

### Migration Structure and Ordering

**Migration Files** (in execution order):
1. `20260207142745-enable-pgcrypto.js` - Enable UUID extension
2. `20260207142745-create-customers.js` - Create customers table
3. `20260207142746-create-staff-users.js` - Create staff_users table
4. `20260207142746-create-loyalty-config.js` - Create loyalty_config table
5. `20260207142747-create-rewards.js` - Create rewards table
6. `20260207142747-create-transactions.js` - Create transactions table with foreign keys
7. `20260207142748-create-redemptions.js` - Create redemptions table with foreign keys
8. `20260211104900-add-points-balance-to-customers.js` - Add points_balance column

**Migration Management**:
- Tool: sequelize-cli
- Config: `config/config.js` (reads DATABASE_URL from environment)
- Scripts: `db:migrate`, `db:migrate:undo`

### Seed Structure
- **Single seeder**: `20260207160000-seed-initial-data.js`
- **Seed data includes**:
  - loyalty_config: earn_rate = 1.0
  - staff_users: Admin user with PIN hash for "1234"
  - rewards: "Free Bread" (200 points), "$5 Off" (100 points)
- **Seed order**: loyalty_config → staff_users → rewards
- **Delete order** (down): redemptions → transactions → rewards → staff_users → loyalty_config
- Scripts: `db:seed`, `db:seed:undo:all`

### Database-Level Constraints Enforcing Integrity
- **Foreign key constraints**: RESTRICT delete, CASCADE update
- **NOT NULL constraints**: All required fields
- **UNIQUE constraints**: phone_number
- **ENUM constraints**: staff_users.role ('staff', 'admin')
- **DEFAULT values**: points_balance (0), is_active (true), earn_rate (1.0), timestamps
- **Check constraints** (implicit): DECIMAL precision, STRING length limits

---

## 4️⃣ API STRUCTURAL DESIGN

### Authentication Domain

#### POST /v1/auth/login
- **HTTP Method**: POST
- **Path**: `/v1/auth/login`
- **Authentication**: None (public)
- **Role Restriction**: None
- **Request Body**:
  ```json
  {
    "name": "string",
    "pin": "string"
  }
  ```
- **Request Validation**:
  - Type checks: name (string), pin (string)
  - Format: pin must match `/^\d{4,10}$/`
  - Name trimmed and non-empty
- **Response Structure** (200):
  ```json
  {
    "token": "string",
    "user": {
      "id": "string",
      "name": "string",
      "role": "string"
    }
  }
  ```
- **Error Responses**:
  - 400: Invalid request
  - 401: Invalid credentials
  - 403: User inactive
  - 500: Server misconfigured / Unexpected error

#### GET /v1/auth/me
- **HTTP Method**: GET
- **Path**: `/v1/auth/me`
- **Authentication**: Required (Bearer token)
- **Role Restriction**: None (any authenticated user)
- **Request Validation**: None
- **Response Structure** (200):
  ```json
  {
    "user": {
      "sub": "string",
      "role": "string",
      "name": "string"
    }
  }
  ```

#### GET /v1/auth/health
- **HTTP Method**: GET
- **Path**: `/v1/auth/health`
- **Authentication**: None
- **Role Restriction**: None
- **Response Structure** (200):
  ```json
  {
    "ok": true,
    "service": "auth"
  }
  ```

### Customer Domain

#### POST /v1/customers/lookup
- **HTTP Method**: POST
- **Path**: `/v1/customers/lookup`
- **Authentication**: Required
- **Role Restriction**: None (staff or admin)
- **Request Body**:
  ```json
  {
    "phone": "string"
  }
  ```
- **Request Validation**:
  - Type check: phone (string)
  - Format validation via `normalizePhone()`: 10-15 digits
- **Response Structure** (200):
  ```json
  {
    "id": "string",
    "name": "string | null",
    "phone_number": "string",
    "points_balance": "number",
    "created_at": "string",
    "updated_at": "string"
  }
  ```
- **Error Responses**:
  - 400: Invalid request / Invalid phone format
  - 404: Customer not found
  - 500: Unexpected error

#### POST /v1/customers
- **HTTP Method**: POST
- **Path**: `/v1/customers`
- **Authentication**: Required
- **Role Restriction**: None (staff or admin)
- **Request Body**:
  ```json
  {
    "name": "string (optional)",
    "phone": "string"
  }
  ```
- **Request Validation**:
  - Type check: phone (string), name (string or null/undefined)
  - Format validation: phone via `normalizePhone()`
  - Duplicate check: phone_number must be unique
- **Response Structure** (201):
  ```json
  {
    "id": "string",
    "name": "string | null",
    "phone_number": "string",
    "points_balance": "number",
    "created_at": "string",
    "updated_at": "string"
  }
  ```
- **Error Responses**:
  - 400: Invalid request / Invalid phone format
  - 409: Customer already exists
  - 500: Unexpected error

### Transaction Domain

#### POST /v1/transactions/purchase
- **HTTP Method**: POST
- **Path**: `/v1/transactions/purchase`
- **Authentication**: Required
- **Role Restriction**: None (staff or admin)
- **Request Body**:
  ```json
  {
    "customerId": "string",
    "purchaseAmount": "number"
  }
  ```
- **Request Validation**:
  - Type check: customerId (string), purchaseAmount (number)
  - Business validation: purchaseAmount > 0
- **Response Structure** (200):
  ```json
  {
    "transactionId": "string",
    "pointsAwarded": "number",
    "newBalance": "number"
  }
  ```
- **Error Responses**:
  - 400: Invalid request / Invalid amount
  - 401: Unauthorized
  - 404: Customer not found
  - 500: Server misconfigured / Unexpected error

### Redemption Domain

#### GET /v1/rewards
- **HTTP Method**: GET
- **Path**: `/v1/rewards`
- **Authentication**: Required
- **Role Restriction**: None (staff or admin)
- **Query Parameters**:
  - `includeInactive`: "true" | undefined
- **Request Validation**: None
- **Response Structure** (200):
  ```json
  {
    "rewards": [
      {
        "id": "string",
        "name": "string",
        "pointsCost": "number",
        "isActive": "boolean"
      }
    ]
  }
  ```
- **Error Responses**:
  - 500: Unexpected error

#### POST /v1/redemptions
- **HTTP Method**: POST
- **Path**: `/v1/redemptions`
- **Authentication**: Required
- **Role Restriction**: None (staff or admin)
- **Request Body**:
  ```json
  {
    "customerId": "string",
    "rewardId": "string"
  }
  ```
- **Request Validation**:
  - Type check: customerId (string), rewardId (string)
  - Business validation: customer.points_balance >= reward.points_cost
- **Response Structure** (200):
  ```json
  {
    "redemptionId": "string",
    "pointsDeducted": "number",
    "newBalance": "number"
  }
  ```
- **Error Responses**:
  - 400: Invalid request
  - 401: Unauthorized
  - 404: Customer not found / Reward not found
  - 409: Insufficient points
  - 500: Unexpected error

### Admin Config Domain

#### GET /v1/admin/config
- **HTTP Method**: GET
- **Path**: `/v1/admin/config`
- **Authentication**: Required
- **Role Restriction**: admin only
- **Request Validation**: None
- **Response Structure** (200):
  ```json
  {
    "pointsPerDollar": "number"
  }
  ```
- **Error Responses**:
  - 403: Forbidden
  - 404: Loyalty config not found
  - 500: Unexpected error

#### PUT /v1/admin/config
- **HTTP Method**: PUT
- **Path**: `/v1/admin/config`
- **Authentication**: Required
- **Role Restriction**: admin only
- **Request Body**:
  ```json
  {
    "pointsPerDollar": "number"
  }
  ```
- **Request Validation**:
  - Type check: pointsPerDollar (number)
  - Range validation: 0 < pointsPerDollar <= 1000
- **Response Structure** (200):
  ```json
  {
    "pointsPerDollar": "number"
  }
  ```
- **Error Responses**:
  - 400: Invalid request / Out of range
  - 403: Forbidden
  - 500: Unexpected error

### Admin Rewards Domain

#### POST /v1/admin/rewards
- **HTTP Method**: POST
- **Path**: `/v1/admin/rewards`
- **Authentication**: Required
- **Role Restriction**: admin only
- **Request Body**:
  ```json
  {
    "name": "string",
    "requiredPoints": "number"
  }
  ```
- **Request Validation**:
  - Type check: name (string), requiredPoints (number)
  - Trimmed name non-empty
  - requiredPoints > 0
- **Response Structure** (201):
  ```json
  {
    "id": "string",
    "name": "string",
    "pointsCost": "number",
    "isActive": "boolean"
  }
  ```
- **Error Responses**:
  - 400: Invalid request / Validation errors
  - 403: Forbidden
  - 500: Unexpected error

#### PUT /v1/admin/rewards/:id
- **HTTP Method**: PUT
- **Path**: `/v1/admin/rewards/:id`
- **Authentication**: Required
- **Role Restriction**: admin only
- **Request Body**:
  ```json
  {
    "name": "string (optional)",
    "requiredPoints": "number (optional)"
  }
  ```
- **Request Validation**:
  - If name provided: string, trimmed non-empty
  - If requiredPoints provided: number > 0
- **Response Structure** (200):
  ```json
  {
    "id": "string",
    "name": "string",
    "pointsCost": "number",
    "isActive": "boolean"
  }
  ```
- **Error Responses**:
  - 400: Invalid request / Validation errors
  - 403: Forbidden
  - 404: Reward not found
  - 500: Unexpected error

#### PATCH /v1/admin/rewards/:id/active
- **HTTP Method**: PATCH
- **Path**: `/v1/admin/rewards/:id/active`
- **Authentication**: Required
- **Role Restriction**: admin only
- **Request Body**:
  ```json
  {
    "isActive": "boolean"
  }
  ```
- **Request Validation**:
  - Type check: isActive (boolean)
- **Response Structure** (200):
  ```json
  {
    "id": "string",
    "name": "string",
    "pointsCost": "number",
    "isActive": "boolean"
  }
  ```
- **Error Responses**:
  - 400: Invalid request
  - 403: Forbidden
  - 404: Reward not found
  - 500: Unexpected error

### Admin Staff Domain

#### GET /v1/admin/staff
- **HTTP Method**: GET
- **Path**: `/v1/admin/staff`
- **Authentication**: Required
- **Role Restriction**: admin only
- **Request Validation**: None
- **Response Structure** (200):
  ```json
  {
    "users": [
      {
        "id": "string",
        "name": "string",
        "role": "string",
        "isActive": "boolean",
        "createdAt": "string"
      }
    ]
  }
  ```
- **Error Responses**:
  - 403: Forbidden
  - 500: Unexpected error

#### PATCH /v1/admin/staff/:id/active
- **HTTP Method**: PATCH
- **Path**: `/v1/admin/staff/:id/active`
- **Authentication**: Required
- **Role Restriction**: admin only
- **Request Body**:
  ```json
  {
    "isActive": "boolean"
  }
  ```
- **Request Validation**:
  - Type check: isActive (boolean)
  - Business rule: Cannot deactivate own account
- **Response Structure** (200):
  ```json
  {
    "id": "string",
    "name": "string",
    "role": "string",
    "isActive": "boolean"
  }
  ```
- **Error Responses**:
  - 400: Invalid request / Cannot deactivate own account
  - 403: Forbidden
  - 404: Staff user not found
  - 500: Unexpected error

### Health Check

#### GET /health
- **HTTP Method**: GET
- **Path**: `/health`
- **Authentication**: None
- **Role Restriction**: None
- **Response Structure** (200):
  ```json
  {
    "ok": true,
    "service": "james-bakery-loyalty-api"
  }
  ```

---

## 5️⃣ FRONTEND STRUCTURAL DESIGN

### Folder Structure
```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ConfigPanel.tsx
│   │   │   ├── ConfigPanel.css
│   │   │   ├── RewardsAdminTable.tsx
│   │   │   ├── RewardsAdminTable.css
│   │   │   ├── StaffAdminTable.tsx
│   │   │   └── StaffAdminTable.css
│   │   ├── CreateCustomerModal.tsx
│   │   ├── CreateCustomerModal.css
│   │   ├── CustomerHeader.tsx
│   │   ├── CustomerHeader.css
│   │   ├── CustomerSummaryCard.tsx
│   │   ├── CustomerSummaryCard.css
│   │   ├── HomeScreen.tsx
│   │   ├── HomeScreen.css
│   │   ├── LoginScreen.tsx
│   │   ├── LoginScreen.css
│   │   ├── PurchaseForm.tsx
│   │   ├── PurchaseForm.css
│   │   ├── RewardCard.tsx
│   │   ├── RewardCard.css
│   │   ├── RewardList.tsx
│   │   └── RewardList.css
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   └── AdminDashboardPage.css
│   │   ├── CustomerLookupPage.tsx
│   │   ├── CustomerLookupPage.css
│   │   ├── PurchasePage.tsx
│   │   ├── PurchasePage.css
│   │   ├── RedemptionPage.tsx
│   │   └── RedemptionPage.css
│   ├── services/
│   │   ├── admin.service.ts
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   ├── redemption.service.ts
│   │   └── transaction.service.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── customer.ts
│   │   ├── redemption.ts
│   │   ├── reward.ts
│   │   └── transaction.ts
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── eslint.config.js
```

### Component Hierarchy

**Root Level**:
- `main.tsx` → renders `AuthProvider` → `App`

**App Component** (`App.tsx`):
- Manages page routing via state: `'home' | 'customer-lookup' | 'purchase' | 'redemption' | 'admin'`
- Renders one of:
  - `LoginScreen` (if not authenticated)
  - `HomeScreen` (home page)
  - `CustomerLookupPage`
  - `PurchasePage`
  - `RedemptionPage`
  - `AdminDashboardPage`

**HomeScreen** (`components/HomeScreen.tsx`):
- Navigation buttons to:
  - Customer Lookup
  - Admin Dashboard (if admin role)
  - Logout

**CustomerLookupPage** (`pages/CustomerLookupPage.tsx`):
- Contains:
  - Customer search form
  - `CreateCustomerModal`
  - Navigation to Purchase or Redemption

**PurchasePage** (`pages/PurchasePage.tsx`):
- Contains:
  - `CustomerHeader`
  - `CustomerSummaryCard`
  - `PurchaseForm`

**RedemptionPage** (`pages/RedemptionPage.tsx`):
- Contains:
  - `CustomerHeader`
  - `CustomerSummaryCard`
  - `RewardList` → `RewardCard[]`

**AdminDashboardPage** (`pages/admin/AdminDashboardPage.tsx`):
- Contains:
  - `ConfigPanel`
  - `RewardsAdminTable`
  - `StaffAdminTable`

**Reusable Components**:
- `LoginScreen`: Authentication form
- `CustomerHeader`: Customer info display
- `CustomerSummaryCard`: Points balance display
- `PurchaseForm`: Purchase amount input
- `RewardCard`: Individual reward display
- `RewardList`: List of rewards
- `CreateCustomerModal`: Customer creation form
- `ConfigPanel`: Loyalty config editor
- `RewardsAdminTable`: Reward management table
- `StaffAdminTable`: Staff management table

### Routing Strategy
- **Client-side routing** via React state
- No router library (react-router-dom not used)
- Page state managed in `App.tsx`: `currentPage` state variable
- Navigation: Callback props (`onNavigate`, `onNavigateBack`, etc.)
- Page transitions: `setCurrentPage()` updates
- Customer context: `selectedCustomer` state passed between pages

### Authentication State Management
- **React Context API** (`AuthContext`)
- Provider: `AuthProvider` wraps entire app
- Context holds:
  - `user`: User object or null
  - `token`: JWT string or null
  - `isLoading`: Boolean initialization flag
  - `login(name, pin)`: Async function
  - `logout()`: Function
- Hook: `useAuth()` for consuming context
- State initialization: `useEffect` in `AuthProvider` checks localStorage on mount

### Token Persistence Strategy
- **localStorage**: Key `'auth_token'`
- Token saved on successful login
- Token loaded on app initialization
- Token removed on logout
- Token validation: `GET /v1/auth/me` on app load
- Invalid token: Automatically cleared from localStorage

### API Abstraction Layer Structure

**Service Classes** (static methods):
- `AuthService` (`services/auth.service.ts`):
  - `login(request)`: POST /v1/auth/login
  - `getMe(token)`: GET /v1/auth/me

- `CustomerService` (`services/customer.service.ts`):
  - `lookup(request, token)`: POST /v1/customers/lookup
  - `create(request, token)`: POST /v1/customers

- `TransactionService` (`services/transaction.service.ts`):
  - `createPurchase(request, token)`: POST /v1/transactions/purchase

- `RedemptionService` (`services/redemption.service.ts`):
  - `getRewards(token)`: GET /v1/rewards
  - `redeemReward(request, token)`: POST /v1/redemptions

- `AdminService` (`services/admin.service.ts`):
  - `getConfig(token)`: GET /v1/admin/config
  - `updateConfig(token, config)`: PUT /v1/admin/config
  - `createReward(token, reward)`: POST /v1/admin/rewards
  - `updateReward(token, id, reward)`: PUT /v1/admin/rewards/:id
  - `toggleRewardActive(token, id, isActive)`: PATCH /v1/admin/rewards/:id/active
  - `getStaff(token)`: GET /v1/admin/staff
  - `toggleStaffActive(token, id, isActive)`: PATCH /v1/admin/staff/:id/active

**API Configuration**:
- Base URL: `/v1` (proxied by Vite dev server)
- Headers: `Content-Type: application/json`, `Authorization: Bearer {token}`
- Error handling: Parse JSON error response or fallback message

### Form Validation Logic
- **Client-side validation** in components
- Input validation patterns:
  - PIN format: Display hint "4-10 digits"
  - Phone number: Validated server-side
  - Purchase amount: Number type input, > 0 check
  - Required fields: Empty string checks
  - Name trimming before submission
- Validation timing: On form submit
- No validation library used

### Error State Handling
- **Local component state**: `error` state variable
- Error display: Conditional rendering of error messages
- Error clearing: Reset on new action
- Pattern:
  ```typescript
  const [error, setError] = useState<string | null>(null);
  try {
    // API call
    setError(null);
  } catch (err) {
    setError(err.message);
  }
  ```
- Error UI: Red text display

### Loading State Handling
- **Local component state**: `isLoading` or `isSubmitting` state variables
- Loading UI patterns:
  - Button disabled during submission
  - Loading text display ("Loading...")
  - Form fields disabled during API calls
- Global loading: `isLoading` in `AuthContext` for initialization
- Pattern:
  ```typescript
  const [isLoading, setIsLoading] = useState(false);
  setIsLoading(true);
  await apiCall();
  setIsLoading(false);
  ```

### Role-Based UI Rendering Logic
- **Conditional rendering** based on `user.role`
- Check: `user?.role === 'admin'`
- Admin-only features:
  - Admin Dashboard button (HomeScreen)
  - Admin Dashboard page access
- Staff features: All non-admin features
- Implementation: `{user?.role === 'admin' && <AdminButton />}`

---

## 6️⃣ SECURITY DESIGN IMPLEMENTATION

### PIN/Password Hashing Implementation
- **Library**: bcryptjs
- **Hashing**:
  - Algorithm: bcrypt
  - Salt rounds: 10
  - Function: `bcrypt.hash(pin, 10)`
  - Location: Seeder file (`seeders/20260207160000-seed-initial-data.js`)
- **Verification**:
  - Function: `bcrypt.compare(pin, staffUser.pin_hash)`
  - Location: Login route (`POST /v1/auth/login`)
  - Timing-safe comparison (bcrypt built-in)

### JWT Generation Logic
- **Library**: jsonwebtoken
- **Generation** (`POST /v1/auth/login`):
  - Payload:
    ```javascript
    {
      sub: staffUser.id,
      role: staffUser.role,
      name: staffUser.name
    }
    ```
  - Secret: `process.env.JWT_SECRET`
  - Options: `{ expiresIn: process.env.JWT_EXPIRES_IN ?? "12h" }`
  - Function: `jwt.sign(payload, secret, options)`

### JWT Verification Logic
- **Middleware**: `requireAuth` (`src/middleware/auth.middleware.ts`)
- **Verification**:
  - Function: `jwt.verify(token, jwtSecret)`
  - Returns: `JwtPayload` object
  - Error handling: Try-catch, returns 401 on error
- **Payload extraction**:
  - `sub` (user ID)
  - `role` (user role)
  - `name` (user name)
- **Validation**:
  - Required fields check
  - Role validation via type guard: `isValidRole(role)`

### Token Expiration Handling
- **Backend**:
  - Expiration: Configured via `JWT_EXPIRES_IN` (default "12h")
  - JWT library handles expiration automatically
  - Expired token: `jwt.verify()` throws error → 401 response
- **Frontend**:
  - No automatic refresh
  - Expired token: API returns 401
  - User must log in again
  - Token cleared from localStorage on 401 response (implicit via login flow)

### CORS Configuration
- **Middleware**: `cors` package
- **Configuration** (`server.ts`):
  ```typescript
  cors({ origin: process.env.CORS_ORIGIN ?? "*" })
  ```
- **Default**: Allow all origins (`"*"`)
- **Production**: Set `CORS_ORIGIN` environment variable
- **Credentials**: Not explicitly configured

### Helmet/Security Middleware
- **Middleware**: `helmet()` package
- **Position**: First middleware in chain
- **Configuration**: Default helmet settings
- **Headers set**:
  - Content-Security-Policy
  - X-DNS-Prefetch-Control
  - X-Frame-Options
  - X-Download-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
  - X-Permitted-Cross-Domain-Policies
  - Referrer-Policy
  - X-XSS-Protection (deprecated but included)

### Input Sanitization Strategy
- **Type validation**: TypeScript + runtime `typeof` checks
- **String trimming**: `name.trim()` on user inputs
- **Phone normalization**: `normalizePhone()` strips non-digits
- **Regex validation**: PIN format `/^\d{4,10}$/`
- **SQL injection protection**: Sequelize ORM parameterized queries
- **XSS protection**: Express JSON parser, React escapes by default
- **No explicit sanitization library**

### Environment Variable Usage

**Backend Environment Variables**:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret (required)
- `JWT_EXPIRES_IN`: Token expiration (default "12h")
- `CORS_ORIGIN`: CORS allowed origin (default "*")
- `PORT`: Server port (default 4000)

**Frontend Environment Variables**:
- No explicit environment variables
- API base URL: Hardcoded `/v1` (proxied by Vite)

### Secret Management Strategy
- **dotenv**: Load from `.env` file
- **Environment variables**: Secrets not committed to repository
- **Access**: `process.env.VARIABLE_NAME`
- **Validation**: Check for missing secrets at runtime
- **Error handling**: Return 500 if `JWT_SECRET` missing
- **Storage**: Stored outside codebase in deployment environment

---

## 7️⃣ CONFIGURATION AND ENVIRONMENT MANAGEMENT

### All Environment Variables

**Backend**:
- `DATABASE_URL`: PostgreSQL connection string (required)
  - Format: `postgresql://user:password@host:port/database`
  - Used by: Sequelize connection, migrations, seeders

- `JWT_SECRET`: JWT signing and verification secret (required)
  - Used by: Authentication middleware, login route
  - Security: Must be strong random string

- `JWT_EXPIRES_IN`: JWT token expiration duration (optional)
  - Default: `"12h"`
  - Format: Zeit/ms format (e.g., "12h", "7d", "1y")
  - Used by: JWT generation

- `CORS_ORIGIN`: CORS allowed origin (optional)
  - Default: `"*"` (all origins)
  - Format: URL string or "*"
  - Used by: CORS middleware

- `PORT`: Server listening port (optional)
  - Default: `4000`
  - Type: Number
  - Used by: Express server

**Frontend**:
- No environment variables used
- Vite proxy configuration handles API routing

### Config Loading Mechanism

**Backend**:
- **dotenv** package
- Loading: `dotenv.config()` at top of `server.ts` and `db/index.ts`
- Config file: `.env` in project root
- Sequelize config: `config/config.js` reads `DATABASE_URL`
- Multiple environments: Same `DATABASE_URL` for dev/test/prod (differentiate by value)

**Frontend**:
- No config loading
- Vite build-time configuration in `vite.config.ts`

### Development vs Production Differences

**Backend**:
- **Logging**: Morgan "dev" format (always enabled)
- **Database logging**: Disabled (`logging: false`)
- **CORS**: Configured via environment variable
- **No NODE_ENV checks** in code

**Frontend**:
- **Development**: Vite dev server with HMR
- **Production**: Static build via `vite build`
- **Proxy**: Only in development (Vite proxy `/v1` → `http://localhost:4000`)

### Database Connection Management
- **Connection library**: Sequelize
- **Connection creation**:
  ```typescript
  new Sequelize(databaseUrl ?? "", {
    dialect: "postgres",
    logging: false,
  })
  ```
- **Connection initialization**: `sequelize.authenticate()` on server startup
- **Error handling**: Logs error and exits process if connection fails
- **Single connection**: Shared sequelize instance exported from `db/index.ts`

### Connection Pooling
- **Sequelize default pool settings** (implicit):
  - Max connections: 5
  - Min connections: 0
  - Idle timeout: 10000ms
  - Acquire timeout: 60000ms
- **No explicit pool configuration** in code

---

## 8️⃣ DEPLOYMENT & INFRASTRUCTURE

### Docker Files
- **No Dockerfile present** in repository
- **docker-compose.yml exists**

### docker-compose Configuration

**File**: `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: james_loyalty
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Configuration Details**:
- **Service**: PostgreSQL database only
- **Image**: `postgres:16`
- **Database credentials**:
  - User: `postgres`
  - Password: `postgres`
  - Database: `james_loyalty`
- **Port mapping**: `5433:5432` (host:container)
- **Volume**: `pgdata` for data persistence
- **Network**: Default bridge network

**Missing Services**:
- No backend service defined
- No frontend service defined
- Backend and frontend run outside Docker

### Build Scripts

**Backend** (`backend/package.json`):
- `"build": "tsc"`: Compile TypeScript to JavaScript
  - Input: `src/**/*.ts`
  - Output: `dist/` directory
  - Config: `tsconfig.json`

**Frontend** (`frontend/package.json`):
- `"build": "tsc -b && vite build"`: TypeScript check + Vite build
  - TypeScript: Type checking
  - Vite: Bundle for production
  - Output: `dist/` directory

### Start Scripts

**Backend** (`backend/package.json`):
- `"dev": "ts-node-dev --respawn --transpile-only ./src/server.ts"`
  - Development: Auto-restart on file changes
  - TypeScript execution without type checking
- `"start": "node dist/server.js"`
  - Production: Run compiled JavaScript
  - Requires prior `npm run build`

**Frontend** (`frontend/package.json`):
- `"dev": "vite"`: Development server with HMR
  - Port: Default 5173
  - Proxy configured in `vite.config.ts`
- `"preview": "vite preview"`: Preview production build locally

### Migration Execution Process

**Commands** (backend):
- `"db:migrate": "sequelize-cli db:migrate"`: Run pending migrations
- `"db:migrate:undo": "sequelize-cli db:migrate:undo"`: Rollback last migration

**Execution**:
1. Ensure `DATABASE_URL` is set
2. Run `npm run db:migrate`
3. Sequelize-CLI reads `config/config.js`
4. Executes migrations in `migrations/` directory in order
5. Tracks executed migrations in `SequelizeMeta` table

**Seed Execution**:
- `"db:seed": "sequelize-cli db:seed:all"`: Run all seeders
- `"db:seed:undo:all": "sequelize-cli db:seed:undo:all"`: Rollback all seeders

### CI/CD Workflows
- **No CI/CD workflows present**
- **No `.github/workflows/` directory**

### GitHub Actions Usage
- **Not implemented**
- No automated testing
- No automated deployment
- No automated linting

---

## 9️⃣ STRUCTURAL DESIGN PATTERNS OBSERVED

### Separation of Concerns
- **Route handlers**: HTTP request/response logic
- **Models**: Data structure and database mapping
- **Middleware**: Cross-cutting concerns (auth, logging, security)
- **Services (frontend)**: API communication abstraction
- **Components (frontend)**: UI rendering
- **Types**: TypeScript interfaces separate from implementation

### Layered Architecture
- **Three-tier architecture**:
  1. Presentation Layer (React frontend)
  2. Application Layer (Express routes)
  3. Data Layer (Sequelize ORM + PostgreSQL)
- **Clear boundaries**: Frontend ↔ REST API ↔ Database
- **No business logic layer**: Logic embedded in route handlers

### Middleware Pattern
- **Express middleware chain**:
  - Global: helmet → cors → body-parser → morgan
  - Route-level: requireAuth → requireRole
- **Composable**: Middleware functions chained via `app.use()` and route parameters
- **Next() propagation**: Explicit control flow

### Service Abstraction
- **Frontend services**: Static class methods abstracting fetch() calls
- **Single responsibility**: Each service handles one domain
- **Consistent interface**: All methods accept token parameter
- **Error handling**: Consistent try-catch and error message extraction

### Modular Routing
- **Separate route files** per domain
- **Express Router**: Each file exports configured router
- **Mounted with prefix**: `app.use("/v1/...", router)`
- **Domain grouping**:
  - auth.routes.ts → Authentication
  - customer.routes.ts → Customer management
  - transaction.routes.ts → Purchase transactions
  - redemption.routes.ts → Rewards and redemptions
  - admin.*.routes.ts → Admin operations

### Transaction Wrapper Pattern
- **Sequelize transactions**: `sequelize.transaction(async (t) => {...})`
- **Atomic operations**: Multiple DB operations within single transaction
- **Automatic rollback**: On error thrown
- **Automatic commit**: On successful completion
- **Used in**: Purchase and redemption flows

### DTO Usage
- **TypeScript interfaces** define data transfer objects
- **Request/Response types**: Separate interfaces for API contracts
- **Model attributes**: Separate from creation attributes
- **Transformation**: Model data → Response DTO in routes
- **No explicit DTO classes**: Plain objects with type annotations

### Repository Pattern
- **NOT implemented**
- **Direct model access**: Routes directly call Sequelize model methods
- **No abstraction layer**: Between business logic and data access

### Dependency Injection
- **NOT implemented**
- **Direct imports**: Modules import dependencies directly
- **Singleton pattern**: Sequelize instance exported and imported
- **No DI container**

---

END OF TECHNICAL DESIGN REPORT
