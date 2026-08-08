# Final Project Report: Bakery Loyalty System

## 1️⃣ Technology Stack & Implementation Details

### Backend Runtime and Version
- **Runtime**: Node.js
- **Package Manager**: Yarn 4.9.1
- **Language**: TypeScript 5.9.3
- **Target**: ES2021
- **Module System**: CommonJS
- **Build Output**: dist/

### Backend Framework
- **Framework**: Express.js 5.2.1
- **HTTP Server**: Built-in Express server

### Database
- **Engine**: PostgreSQL 16
- **ORM**: Sequelize 6.37.7
- **CLI Tool**: sequelize-cli 6.6.5
- **Dialect**: postgres
- **Driver**: pg 8.18.0
- **Additional**: pg-hstore 2.3.4

### Frontend Framework and Version
- **Framework**: React 19.2.0
- **DOM Renderer**: react-dom 19.2.0
- **Build Tool**: Vite 7.2.4
- **Language**: TypeScript 5.9.3
- **Target**: ES2022
- **Module System**: ESNext
- **JSX**: react-jsx
- **Module Resolution**: bundler

### Major Backend Dependencies
```json
{
  "bcryptjs": "^3.0.2",
  "cors": "^2.8.6",
  "dotenv": "^17.2.4",
  "express": "^5.2.1",
  "helmet": "^8.1.0",
  "jsonwebtoken": "^9.0.3",
  "morgan": "^1.10.1",
  "pg": "^8.18.0",
  "pg-hstore": "^2.3.4",
  "sequelize": "^6.37.7"
}
```

### Major Backend DevDependencies
```json
{
  "@types/bcryptjs": "^3.0.0",
  "@types/cors": "^2.8.19",
  "@types/express": "^5.0.6",
  "@types/jsonwebtoken": "^9.0.10",
  "@types/morgan": "^1.9.10",
  "@types/node": "^25.2.1",
  "sequelize-cli": "^6.6.5",
  "ts-node-dev": "^2.0.0",
  "typescript": "^5.9.3"
}
```

### Major Frontend Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

### Major Frontend DevDependencies
```json
{
  "@eslint/js": "^9.39.1",
  "@types/node": "^24.10.1",
  "@types/react": "^19.2.5",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.1",
  "eslint": "^9.39.1",
  "eslint-plugin-react-hooks": "^7.0.1",
  "eslint-plugin-react-refresh": "^0.4.24",
  "globals": "^16.5.0",
  "typescript": "~5.9.3",
  "typescript-eslint": "^8.46.4",
  "vite": "^7.2.4"
}
```

### Authentication Implementation
- **Method**: JWT (JSON Web Token)
- **Library**: jsonwebtoken 9.0.3
- **Token Storage**: localStorage (frontend)
- **Token Key**: "auth_token"
- **PIN Hashing**: bcryptjs 3.0.2 with bcrypt hash algorithm
- **Hash Rounds**: 10
- **PIN Validation**: 4-10 digit numeric PIN format
- **Token Expiration**: Configurable via JWT_EXPIRES_IN environment variable (default: 12h)
- **Token Claims**: 
  - sub: User ID
  - role: User role (staff/admin)
  - name: User name
- **Authorization Header Format**: Bearer {token}
- **Authentication Middleware**: requireAuth (validates JWT)
- **Role-Based Access Control**: requireRole middleware with role array parameter

### Transaction Handling Mechanism
- **Implementation**: Sequelize transactions
- **Type**: Managed transactions with transaction callback
- **Isolation**: Default PostgreSQL isolation level
- **Operations**:
  - Purchase transactions: Atomic customer point balance update and transaction record creation
  - Redemption transactions: Atomic customer point deduction and redemption record creation
- **Rollback**: Automatic on error within transaction block
- **Commit**: Automatic on successful transaction completion

### Validation Mechanism
- **Input Type Validation**: Runtime type checks using typeof
- **Phone Number Validation**: 
  - Normalization: Strips all non-digit characters
  - Length: 10-15 digits required
  - Implementation: normalizePhone utility function
- **PIN Validation**: Regex pattern /^\d{4,10}$/
- **Amount Validation**: Must be positive number (> 0)
- **Points Validation**: Must be positive integer (> 0)
- **Configuration Validation**: pointsPerDollar must be between 0 and 1000
- **String Validation**: Non-empty after trim for names
- **Boolean Validation**: Explicit type check for boolean flags
- **UUID Validation**: Database-level via Sequelize and PostgreSQL constraints

### Error Handling Strategy
- **HTTP Status Codes**:
  - 200: Success
  - 201: Created
  - 400: Bad request / Invalid input
  - 401: Unauthorized / Invalid credentials
  - 403: Forbidden / Insufficient permissions / User inactive
  - 404: Resource not found
  - 409: Conflict / Duplicate resource / Insufficient points
  - 500: Internal server error / Unexpected error
- **Error Response Format**: JSON with "error" field containing error message
- **Try-Catch Blocks**: All route handlers wrapped in try-catch
- **Specific Error Handling**: Custom error types thrown within transactions
- **Error Logging**: console.error for all caught errors
- **Database Error Handling**: Sequelize error propagation with transaction rollback
- **Frontend Error Handling**: Service layer throws errors caught by UI components

### Logging Implementation
- **HTTP Logging**: morgan 1.10.1
- **Format**: "dev" format (colored output by response status)
- **Application Logging**: console.log and console.error
- **Database Logging**: Disabled (logging: false in Sequelize config)
- **Logged Events**:
  - Server startup
  - Database connection status
  - Route errors with context
  - Transaction failures

### Environment Configuration Management
- **Library**: dotenv 17.2.4
- **Configuration File**: .env (not committed to repository)
- **Loading**: dotenv.config() called in server.ts and config/config.js
- **Required Variables**:
  - DATABASE_URL: PostgreSQL connection string
  - JWT_SECRET: Secret key for JWT signing
  - PORT: API server port (default: 4000)
  - CORS_ORIGIN: Allowed CORS origin (default: "*")
  - JWT_EXPIRES_IN: JWT token expiration (default: "12h")
- **Environment Separation**: Same configuration structure for development, test, production
- **Frontend Environment**: Vite environment variables (not explicitly configured)

### Security Middleware and Configuration
- **helmet**: 8.1.0 - HTTP security headers
  - Enabled for all routes
  - Default configuration
- **cors**: 2.8.6 - Cross-Origin Resource Sharing
  - Configurable origin via CORS_ORIGIN environment variable
  - Default: Allow all origins (*)
- **express.json()**: Body parser with 1mb limit
- **Authentication**: JWT-based with Bearer token scheme
- **PIN Security**: Bcrypt hashing with salt rounds = 10
- **Password Storage**: No plaintext storage, only hashed values
- **SQL Injection Protection**: Sequelize ORM parameterized queries
- **Foreign Key Constraints**: RESTRICT on delete, CASCADE on update

### Code Modularization Strategy
**Backend Structure**:
```
backend/src/
├── db/           # Database connection configuration
├── middleware/   # Authentication and authorization middleware
├── models/       # Sequelize ORM models
├── routes/       # Express route handlers (modular by resource)
├── types/        # TypeScript type definitions and extensions
├── utils/        # Utility functions (phone normalization)
└── server.ts     # Application entry point
```

**Frontend Structure**:
```
frontend/src/
├── components/   # Reusable React components
├── contexts/     # React Context API providers
├── hooks/        # Custom React hooks
├── pages/        # Page-level components
├── services/     # API service layer
├── types/        # TypeScript type definitions
├── App.tsx       # Main application component
└── main.tsx      # Application entry point
```

---

## 2️⃣ Engineering Practices Implemented

### Separation of Concerns
- **Backend**:
  - Route handlers separated from business logic
  - Database models isolated in dedicated files
  - Middleware extracted for reusability
  - Utility functions in separate module
  - Type definitions in dedicated directory
- **Frontend**:
  - UI components separated from business logic
  - State management via Context API
  - API calls abstracted in service layer
  - Custom hooks for logic reuse
  - Type definitions in separate files

### Layered Architecture
**Backend Layers**:
1. **Presentation Layer**: Express routes (routes/)
2. **Middleware Layer**: Authentication, RBAC (middleware/)
3. **Business Logic Layer**: Embedded in route handlers with transaction management
4. **Data Access Layer**: Sequelize models (models/)
5. **Database Layer**: PostgreSQL

**Frontend Layers**:
1. **Presentation Layer**: React components (components/, pages/)
2. **State Management Layer**: Context API (contexts/)
3. **Service Layer**: API communication (services/)
4. **Type Layer**: TypeScript definitions (types/)

### Modular Routing
**Backend Routes**:
- `auth.routes.ts`: Authentication endpoints (/v1/auth/*)
- `customer.routes.ts`: Customer management (/v1/customers/*)
- `transaction.routes.ts`: Purchase transactions (/v1/transactions/*)
- `redemption.routes.ts`: Reward redemption and listing (/v1/rewards, /v1/redemptions)
- `admin.config.routes.ts`: Admin configuration (/v1/admin/config)
- `admin.rewards.routes.ts`: Admin reward management (/v1/admin/rewards/*)
- `admin.staff.routes.ts`: Admin staff management (/v1/admin/staff/*)

**Route Organization**:
- Functional grouping by resource
- Separate admin routes with role-based protection
- Single responsibility per route file

### Middleware Usage
**Authentication Middleware**:
- `requireAuth`: Validates JWT token and attaches user to request
- `requireRole`: Validates user role for RBAC

**Security Middleware**:
- `helmet()`: Security headers
- `cors()`: CORS configuration
- `express.json()`: JSON body parsing with size limit
- `morgan()`: HTTP request logging

**Middleware Application**:
- Global middleware applied to all routes
- Route-specific middleware applied per endpoint
- Middleware chaining for layered protection
- Admin routes protected with both requireAuth and requireRole

### Service Abstraction
**Frontend Services**:
- `AuthService`: Login, token validation, user session
- `CustomerService`: Customer lookup and creation
- `TransactionService`: Purchase transaction creation
- `RedemptionService`: Reward listing and redemption
- `AdminService`: Configuration, rewards, and staff management

**Service Pattern**:
- Static methods for API calls
- Consistent error handling
- Centralized API base URL configuration
- Automatic Authorization header injection

### Transaction Wrappers
**Implementation**: Sequelize managed transactions
```typescript
await sequelize.transaction(async (t) => {
  // 1. Fetch resources with transaction
  // 2. Validate business rules
  // 3. Create records with transaction
  // 4. Update related records atomically
  // 5. Return result
});
```

**Usage**:
- Purchase transactions (transaction.routes.ts)
- Redemption transactions (redemption.routes.ts)
- Automatic rollback on error
- Automatic commit on success

### Data Integrity Enforcement
**Database Constraints**:
- Primary Keys: UUID with gen_random_uuid()
- Foreign Keys: RESTRICT on delete, CASCADE on update
- NOT NULL constraints on required fields
- UNIQUE constraints on phone_number
- ENUM constraints on user roles
- DEFAULT values for timestamps and flags

**Application-Level Integrity**:
- Duplicate customer check before creation
- Insufficient points check before redemption
- Customer existence validation before transaction
- Reward existence validation before redemption
- Self-deactivation prevention for staff users
- Active status check for staff login

**Indexes**:
- transactions: (customer_id, created_at)
- redemptions: (customer_id, created_at)

### Configuration Isolation
**Backend Configuration**:
- Environment variables via dotenv
- Database configuration in config/config.js
- Sequelize configuration per environment
- JWT secret isolation in environment variables
- Port and CORS configuration via environment

**Frontend Configuration**:
- API base URL: /v1 (proxied via Vite)
- Vite proxy configuration for development
- Build-time TypeScript configuration
- ESLint configuration for code quality

### Code Reuse Strategies
**Backend Reuse**:
- Shared authentication middleware across all protected routes
- Role-based authorization middleware with parameter
- Phone normalization utility function
- Sequelize model base configuration
- Transaction pattern reused across purchase and redemption

**Frontend Reuse**:
- Custom useAuth hook for authentication state
- Shared UI components (CustomerHeader, CustomerSummaryCard, RewardCard)
- Service layer methods for API calls
- Context providers for global state
- Type definitions shared across components

---

## 3️⃣ Verification & Test Plan Evidence

### Testing Frameworks Used
- **No automated test framework detected**
- Manual testing documentation present

### Test Files and Coverage
**Test Documentation Files**:
- `TESTING-EPIC7.md`: Customer Lookup & Creation testing instructions (253 lines)
- `TESTING-EPIC8.md`: Admin Configuration testing instructions (394 lines)

**Test Coverage Areas**:
- Customer lookup and creation
- Purchase transactions
- Reward redemption
- Admin configuration management
- Reward management (CRUD operations)
- Staff management
- Role-based access control
- Authentication and authorization
- Error handling scenarios
- UI/UX interactions

### API Testing Scripts or Examples
**Manual API Testing (curl examples in TESTING-EPIC8.md)**:

**Login**:
```bash
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","pin":"1234"}'
```

**Config Endpoints**:
```bash
# GET config
curl -X GET http://localhost:4000/v1/admin/config \
  -H "Authorization: Bearer $TOKEN"

# UPDATE config
curl -X PUT http://localhost:4000/v1/admin/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"pointsPerDollar": 2.5}'
```

**Reward Management**:
```bash
# Create reward
curl -X POST http://localhost:4000/v1/admin/rewards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Free Coffee","requiredPoints":50}'

# Update reward
curl -X PUT http://localhost:4000/v1/admin/rewards/{reward-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Free Coffee Updated","requiredPoints":75}'

# Deactivate reward
curl -X PATCH http://localhost:4000/v1/admin/rewards/{reward-id}/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isActive":false}'
```

**Customer Operations**:
```bash
# Lookup Customer
curl -X POST http://localhost:4000/v1/customers/lookup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"phone":"5551234567"}'

# Create Customer
curl -X POST http://localhost:4000/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Customer","phone":"5551234567"}'
```

### Manual Testing Evidence
**TESTING-EPIC7.md Test Checklist**:
- Login Flow
  - Valid credentials
  - Invalid credentials error handling
- Navigation
  - Customer Lookup button on Home Screen
  - Navigation to Customer Lookup page
  - Back to Home button functionality
- Customer Lookup
  - Phone input accepts various formats
  - Phone normalization works correctly
  - Loading state displays during API call
  - Found customer shows summary card
  - Not found customer shows create form
- Customer Creation
  - Name input is required
  - Phone is pre-filled and disabled
  - Success shows customer summary card immediately
  - Duplicate customer shows appropriate error
- Error Handling
  - Unauthorized requests trigger logout
  - Network errors show error message
  - Error messages are clear and actionable
- UI/UX
  - Large touch targets (tablet-friendly)
  - Responsive design on different screen sizes
  - Consistent styling with login screen
  - All buttons have hover states
  - Loading states are clear

**TESTING-EPIC8.md Verification Checklist**:
Backend:
- Admin can access all /v1/admin/* endpoints
- Staff cannot access /v1/admin/* endpoints (403 Forbidden)
- Config GET returns current settings
- Config PUT updates settings and persists to database
- Config validation rejects invalid values (≤0 or >1000)
- Reward creation works and returns created reward
- Reward update works and modifies existing reward
- Reward active/inactive toggle works
- Inactive rewards are excluded from /v1/rewards
- Inactive rewards are included with ?includeInactive=true
- Staff list returns all users with roles and status
- Staff deactivation prevents login
- Cannot deactivate self (returns 400 error)
- Updated config affects transaction calculations

Frontend:
- Admin Panel button visible only for admin users
- Admin Panel button hidden for staff users
- Admin Dashboard shows all three tabs
- Configuration tab displays and updates settings
- Rewards tab shows all rewards (including inactive)
- Can create new rewards via UI
- Can edit existing rewards via UI
- Can toggle reward active/inactive status
- Confirmation dialog appears for destructive actions
- Staff tab shows all staff with roles and status
- Can toggle staff active/inactive status
- Deactivated staff cannot login
- Staff role cannot access admin UI (403 page)
- Tab navigation works correctly
- Back to Home button works
- UI is responsive and tablet-friendly

### Role-Based Access Testing Evidence
**RBAC Test (TESTING-EPIC8.md)**:
```bash
# Login as staff
STAFF_TOKEN=$(curl -s -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"TestStaff","pin":"1234"}' | jq -r '.token')

# Try to access admin endpoint
curl -X GET http://localhost:4000/v1/admin/config \
  -H "Authorization: Bearer $STAFF_TOKEN"
```
Expected Result: Returns {"error": "Forbidden"} with status 403

**Frontend RBAC**:
- Admin Panel button only visible for admin users
- Staff users cannot manually navigate to admin pages
- 403 page shown if staff tries to access admin UI

### Validation Test Evidence
**Phone Number Normalization Tests (TESTING-EPIC7.md)**:
| Input Format | Normalized Output |
|--------------|-------------------|
| 555-123-4567 | 5551234567 |
| (555) 123-4567 | 5551234567 |
| 555 123 4567 | 5551234567 |
| 555.123.4567 | 5551234567 |
| +1-555-123-4567 | 15551234567 |

**Configuration Validation**:
- Points per dollar validation: must be > 0 and ≤ 1000
- Invalid values rejected with 400 error

**Input Validation Tests**:
- Empty name rejected
- Non-numeric PIN rejected
- Negative amounts rejected
- Invalid phone format rejected

### Error Scenario Handling Evidence
**Customer Creation Errors (TESTING-EPIC7.md)**:
- Duplicate customer error: "This customer already exists. Try looking up again."
- Unauthorized access triggers logout
- Network errors show error message

**Staff Management Errors (TESTING-EPIC8.md)**:
- Self-deactivation prevented: "Cannot deactivate your own account"
- Inactive user login: "User inactive" with 403 status

**Transaction Errors**:
- Customer not found: 404 error
- Reward not found: 404 error
- Insufficient points: 409 error with "Insufficient points"
- Invalid purchase amount: 400 error

### Concurrency or Transaction Handling Tests
**Transaction Atomicity (TESTING-EPIC8.md Integration Tests)**:
- Config update affects subsequent transactions
- Points balance updates are atomic (no race conditions)
- Redemption deducts points atomically
- Purchase adds points atomically

**Database Verification Commands**:
```sql
-- Check current config
SELECT * FROM loyalty_config;

-- Check all rewards with status
SELECT id, name, points_cost, is_active FROM rewards ORDER BY created_at DESC;

-- Check staff users
SELECT id, name, role, is_active FROM staff_users;

-- Check recent transactions to verify points calculation
SELECT t.id, t.amount, t.points_earned, c.name as customer_name
FROM transactions t
JOIN customers c ON t.customer_id = c.id
ORDER BY t.created_at DESC
LIMIT 5;
```

### Test Execution Scripts
**Backend Scripts (package.json)**:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only ./src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "sequelize-cli db:migrate",
    "db:migrate:undo": "sequelize-cli db:migrate:undo",
    "db:seed": "sequelize-cli db:seed:all",
    "db:seed:undo:all": "sequelize-cli db:seed:undo:all"
  }
}
```

**Frontend Scripts (package.json)**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

**Manual Test Setup (TESTING-EPIC7.md, TESTING-EPIC8.md)**:
```bash
# Start the database
docker compose up -d

# Start the backend (in backend directory)
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev

# Start the frontend (in frontend directory - in a new terminal)
cd frontend
npm install
npm run dev
```

### CI Pipeline Test Stages
**No CI/CD pipeline detected** - No .github/workflows directory found

### Linting or Static Analysis Tools
**Frontend Linting**:
- **Tool**: ESLint 9.39.1
- **Configuration**: eslint.config.js
- **Plugins**:
  - @eslint/js (recommended config)
  - typescript-eslint 8.46.4
  - eslint-plugin-react-hooks 7.0.1
  - eslint-plugin-react-refresh 0.4.24
- **Rules**: 
  - TypeScript recommended rules
  - React hooks rules
  - React refresh rules
- **Ignored**: dist directory
- **Execution**: `npm run lint`

**Backend Linting**:
- No explicit ESLint configuration detected for backend
- TypeScript compiler with strict mode enabled provides type checking

---

## 4️⃣ Deployment & Operational Readiness

### Dockerfile(s)
**No Dockerfile found in repository**

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
- Database image: PostgreSQL 16
- Database name: james_loyalty
- Default user: postgres
- Default password: postgres
- Port mapping: 5433 (host) → 5432 (container)
- Data persistence: Named volume "pgdata"

### Production Start Scripts
**Backend (package.json)**:
```json
{
  "scripts": {
    "start": "node dist/server.js"
  }
}
```

**Prerequisites**:
- TypeScript compiled to JavaScript in dist/ directory
- Environment variables configured
- Database migrations executed
- Database seed data loaded (optional)

### Build Scripts
**Backend Build**:
```json
{
  "scripts": {
    "build": "tsc"
  }
}
```
- Compiles TypeScript to JavaScript
- Output directory: dist/
- Configuration: tsconfig.json

**Frontend Build**:
```json
{
  "scripts": {
    "build": "tsc -b && vite build"
  }
}
```
- TypeScript type checking with project references
- Vite build optimization
- Output directory: dist/

### Migration Execution Process
**Command**: `npm run db:migrate` or `sequelize-cli db:migrate`

**Migration Files** (chronological order):
1. `20260207142745-enable-pgcrypto.js` - Enable UUID generation extension
2. `20260207142745-create-customers.js` - Create customers table
3. `20260207142746-create-loyalty-config.js` - Create loyalty_config table
4. `20260207142746-create-staff-users.js` - Create staff_users table
5. `20260207142747-create-rewards.js` - Create rewards table
6. `20260207142747-create-transactions.js` - Create transactions table with foreign keys
7. `20260207142748-create-redemptions.js` - Create redemptions table with foreign keys
8. `20260211104900-add-points-balance-to-customers.js` - Add points_balance column

**Migration Configuration**: config/config.js
- Reads DATABASE_URL from environment
- Same configuration for development, test, production
- Logging disabled

**Rollback**: `npm run db:migrate:undo`

### Seed Process
**Command**: `npm run db:seed` or `sequelize-cli db:seed:all`

**Seed File**: `seeders/20260207160000-seed-initial-data.js`

**Seed Data**:
- Loyalty Configuration: earn_rate = 1.0
- Admin User: 
  - Name: "Admin"
  - Role: admin
  - PIN: 1234 (hashed with bcrypt)
  - Status: active
- Rewards:
  - "Free Bread": 200 points, active
  - "$5 Off": 100 points, active

**Seed Features**:
- Cleans existing data before seeding (deletes in dependency order)
- Uses bcrypt to hash PIN
- Generates UUIDs for records

**Unseed**: `npm run db:seed:undo:all`

### Environment Variable Documentation
**Required Backend Variables**:
- `DATABASE_URL`: PostgreSQL connection string
  - Format: postgresql://user:password@host:port/database
  - Example: postgresql://postgres:postgres@localhost:5433/james_loyalty
- `JWT_SECRET`: Secret key for JWT token signing and verification
  - Type: String
  - Security: Must be strong random string
- `PORT`: API server port
  - Type: Number
  - Default: 4000
- `CORS_ORIGIN`: Allowed CORS origin
  - Type: String
  - Default: "*" (allow all origins)
  - Production: Should be specific origin
- `JWT_EXPIRES_IN`: JWT token expiration duration
  - Type: String (e.g., "12h", "7d")
  - Default: "12h"

**Frontend Environment**:
- No explicit environment variables configured
- API proxied through Vite development server (/v1 → http://localhost:4000)

### CI/CD Workflow Configuration
**No CI/CD workflow found** - No .github/workflows directory

### Differences Between Development and Production Setups
**Development**:
- Backend: ts-node-dev with auto-restart
- Frontend: Vite dev server with hot module replacement
- Database: Docker Compose PostgreSQL on port 5433
- API Proxy: Vite proxies /v1 to http://localhost:4000
- Logging: Morgan "dev" format with colors
- Environment: .env file for configuration
- CORS: Typically "*" for all origins

**Production** (Inferred):
- Backend: Compiled JavaScript (node dist/server.js)
- Frontend: Static build served by web server
- Database: Managed PostgreSQL instance
- API Access: Direct URL to backend
- Logging: Morgan "dev" format (should be changed to "combined" or similar)
- Environment: Environment variables from hosting platform
- CORS: Specific origin configuration required
- Database Logging: Disabled for performance

**Build Process**:
- Backend: TypeScript → JavaScript compilation
- Frontend: TypeScript + Vite → Optimized static bundle

---

## 5️⃣ Complete Repository Structure Documentation

### Full Directory Tree
```
.
├── backend/
│   ├── config/
│   │   └── config.js
│   ├── migrations/
│   │   ├── 20260207142745-create-customers.js
│   │   ├── 20260207142745-enable-pgcrypto.js
│   │   ├── 20260207142746-create-loyalty-config.js
│   │   ├── 20260207142746-create-staff-users.js
│   │   ├── 20260207142747-create-rewards.js
│   │   ├── 20260207142747-create-transactions.js
│   │   ├── 20260207142748-create-redemptions.js
│   │   └── 20260211104900-add-points-balance-to-customers.js
│   ├── models/
│   │   └── index.js
│   ├── seeders/
│   │   └── 20260207160000-seed-initial-data.js
│   ├── src/
│   │   ├── db/
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── models/
│   │   │   ├── customer.model.ts
│   │   │   ├── loyaltyConfig.model.ts
│   │   │   ├── redemption.model.ts
│   │   │   ├── reward.model.ts
│   │   │   ├── staffUser.model.ts
│   │   │   └── transaction.model.ts
│   │   ├── routes/
│   │   │   ├── admin.config.routes.ts
│   │   │   ├── admin.rewards.routes.ts
│   │   │   ├── admin.staff.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── customer.routes.ts
│   │   │   ├── redemption.routes.ts
│   │   │   └── transaction.routes.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   ├── utils/
│   │   │   └── phone.ts
│   │   └── server.ts
│   ├── .yarnrc.yml
│   ├── New Text Document.txt
│   ├── README.md
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   └── yarn.lock
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── ConfigPanel.css
│   │   │   │   ├── ConfigPanel.tsx
│   │   │   │   ├── RewardsAdminTable.css
│   │   │   │   ├── RewardsAdminTable.tsx
│   │   │   │   ├── StaffAdminTable.css
│   │   │   │   └── StaffAdminTable.tsx
│   │   │   ├── CreateCustomerModal.css
│   │   │   ├── CreateCustomerModal.tsx
│   │   │   ├── CustomerHeader.css
│   │   │   ├── CustomerHeader.tsx
│   │   │   ├── CustomerSummaryCard.css
│   │   │   ├── CustomerSummaryCard.tsx
│   │   │   ├── HomeScreen.css
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── LoginScreen.css
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── PurchaseForm.css
│   │   │   ├── PurchaseForm.tsx
│   │   │   ├── RewardCard.css
│   │   │   ├── RewardCard.tsx
│   │   │   ├── RewardList.css
│   │   │   └── RewardList.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.css
│   │   │   │   └── AdminDashboardPage.tsx
│   │   │   ├── CustomerLookupPage.css
│   │   │   ├── CustomerLookupPage.tsx
│   │   │   ├── PurchasePage.css
│   │   │   ├── PurchasePage.tsx
│   │   │   ├── RedemptionPage.css
│   │   │   └── RedemptionPage.tsx
│   │   ├── services/
│   │   │   ├── admin.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── redemption.service.ts
│   │   │   └── transaction.service.ts
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   ├── customer.ts
│   │   │   ├── redemption.ts
│   │   │   ├── reward.ts
│   │   │   └── transaction.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .yarnrc.yml
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── yarn.lock
├── .git/
├── .gitignore
├── TESTING-EPIC7.md
├── TESTING-EPIC8.md
└── docker-compose.yml
```

### Folder Responsibilities

**backend/**
- Contains all server-side code and configuration

**backend/config/**
- Database configuration for Sequelize CLI
- Environment-specific settings (development, test, production)

**backend/migrations/**
- Database schema evolution files
- Executed in chronological order by Sequelize CLI
- Contains table creation, alteration, and deletion scripts

**backend/models/**
- Legacy Sequelize models directory (contains only index.js)
- Not actively used (models defined in src/models/)

**backend/seeders/**
- Database seed data scripts
- Populates initial data for development and testing

**backend/src/**
- Main application source code

**backend/src/db/**
- Database connection initialization
- Sequelize instance configuration

**backend/src/middleware/**
- Express middleware functions
- Authentication and authorization logic

**backend/src/models/**
- Sequelize ORM model definitions
- Database table representations with TypeScript types

**backend/src/routes/**
- Express route handlers
- Organized by resource and functionality
- Admin routes separated with "admin." prefix

**backend/src/types/**
- TypeScript type definitions
- Express type extensions for request augmentation

**backend/src/utils/**
- Utility functions
- Phone number normalization logic

**frontend/**
- Contains all client-side code and configuration

**frontend/public/**
- Static assets served as-is
- Contains favicon and other public resources

**frontend/src/**
- Main React application source code

**frontend/src/assets/**
- Application assets (images, icons)

**frontend/src/components/**
- Reusable React UI components
- Organized by feature or hierarchy

**frontend/src/components/admin/**
- Admin-specific React components
- Configuration panel, rewards table, staff table

**frontend/src/contexts/**
- React Context API providers
- Global state management (authentication)

**frontend/src/hooks/**
- Custom React hooks
- Reusable stateful logic

**frontend/src/pages/**
- Page-level components
- Top-level route components

**frontend/src/pages/admin/**
- Admin dashboard pages

**frontend/src/services/**
- API service layer
- HTTP request abstraction
- Centralized API communication

**frontend/src/types/**
- TypeScript type definitions
- Shared interfaces and types

### Major Files

**Root Files**:
- `.gitignore`: Git ignore rules for node_modules, dist, env files
- `docker-compose.yml`: PostgreSQL database container configuration
- `TESTING-EPIC7.md`: Customer lookup and creation testing documentation
- `TESTING-EPIC8.md`: Admin configuration testing documentation

**Backend Files**:
- `backend/package.json`: Backend dependencies and scripts
- `backend/tsconfig.json`: TypeScript compiler configuration
- `backend/src/server.ts`: Application entry point, Express server setup
- `backend/config/config.js`: Sequelize CLI configuration
- `backend/models/index.js`: Legacy Sequelize models index (unused)

**Frontend Files**:
- `frontend/package.json`: Frontend dependencies and scripts
- `frontend/tsconfig.json`: TypeScript project references
- `frontend/tsconfig.app.json`: Application TypeScript configuration
- `frontend/tsconfig.node.json`: Build tooling TypeScript configuration
- `frontend/vite.config.ts`: Vite build tool configuration with proxy
- `frontend/eslint.config.js`: ESLint linting configuration
- `frontend/index.html`: HTML entry point
- `frontend/src/main.tsx`: React application entry point
- `frontend/src/App.tsx`: Main application component with routing

### Separation Between Frontend and Backend
**Complete separation**:
- Separate directories: `backend/` and `frontend/`
- Separate package.json files
- Separate dependency management
- Separate build processes
- Separate TypeScript configurations

**Communication**:
- RESTful API over HTTP
- Backend exposes API on port 4000
- Frontend proxies API requests via Vite
- JSON data exchange format
- JWT token authentication

**Development**:
- Run independently on different ports
- Backend: http://localhost:4000
- Frontend: http://localhost:5173
- Vite proxies /v1 requests to backend

### Configuration File Roles

**backend/config/config.js**:
- Sequelize CLI database configuration
- Environment-specific settings
- Database URL from environment variables

**backend/tsconfig.json**:
- TypeScript compiler options for backend
- Target: ES2021
- Module: CommonJS
- Strict mode enabled
- Output directory: dist/

**backend/.yarnrc.yml**:
- Yarn package manager configuration
- Version: 4.9.1

**frontend/tsconfig.json**:
- TypeScript project references
- Delegates to tsconfig.app.json and tsconfig.node.json

**frontend/tsconfig.app.json**:
- Application TypeScript configuration
- Target: ES2022
- Module: ESNext
- Strict mode enabled with additional checks
- JSX: react-jsx

**frontend/tsconfig.node.json**:
- Build tooling TypeScript configuration
- Target: ES2023
- Module: ESNext

**frontend/vite.config.ts**:
- Vite build tool configuration
- React plugin integration
- Development server proxy configuration (/v1 → http://localhost:4000)

**frontend/eslint.config.js**:
- ESLint linting configuration
- TypeScript and React rules
- Globals and plugins configuration

**frontend/.yarnrc.yml**:
- Yarn package manager configuration

### Migration Folder Role
**Purpose**: Database schema version control

**Functionality**:
- Sequential execution of schema changes
- Up migration: Apply changes
- Down migration: Revert changes
- Timestamp-based ordering
- Idempotent operations

**Managed By**: Sequelize CLI

**Execution**:
- Manual: `npm run db:migrate`
- Rollback: `npm run db:migrate:undo`

### Seed Folder Role
**Purpose**: Populate database with initial data

**Functionality**:
- Insert default configuration
- Create initial admin user
- Add initial rewards
- Clean existing data before seeding
- Development and testing data

**Managed By**: Sequelize CLI

**Execution**:
- Seed: `npm run db:seed`
- Unseed: `npm run db:seed:undo:all`

---

## 6️⃣ Quality Assurance & Maintainability Controls

### Linting Configuration
**Frontend Linting (eslint.config.js)**:
```javascript
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
```

**Configuration Details**:
- Format: Flat config (ESLint 9.x)
- Files: All TypeScript and TSX files
- Excluded: dist directory
- Base configs:
  - JavaScript recommended rules
  - TypeScript recommended rules
  - React Hooks rules (flat config)
  - React Refresh rules for Vite
- Environment: Browser globals
- ECMAScript version: 2020

**Backend Linting**:
- No explicit ESLint configuration found
- Type checking via TypeScript compiler

### TypeScript Strict Mode
**Backend (tsconfig.json)**:
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Frontend (tsconfig.app.json)**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  }
}
```

**Strict Mode Enforces**:
- noImplicitAny
- noImplicitThis
- strictNullChecks
- strictFunctionTypes
- strictBindCallApply
- strictPropertyInitialization
- alwaysStrict

**Frontend Additional Checks**:
- Unused local variables detection
- Unused parameters detection
- Erasable syntax only (type annotations must be erasable)
- No fallthrough cases in switch statements
- No unchecked side effect imports

### Pre-commit Hooks
**No pre-commit hooks detected** - No husky, lint-staged, or git hooks configuration found

### Code Formatting Tools
**No explicit code formatter detected** - No prettier configuration found

**Potential Formatting**:
- ESLint with stylistic rules (frontend)
- TypeScript compiler formatting (implicit)
- Editor-based formatting (not enforced)

### Pull Request Workflow Evidence
**No PR workflow detected** - No GitHub Actions, branch protection, or PR templates found

### Version Control Branching Strategy
**Evidence from Git**:
- Main/master branch (standard)
- No explicit branching strategy documented
- No branch protection rules visible

### Documentation Presence
**Documentation Files**:
1. `backend/README.md`: Minimal (2 lines: "# backend")
2. `frontend/README.md`: Vite + React template README (74 lines)
   - Template setup instructions
   - Plugin information
   - ESLint configuration guidance
3. `TESTING-EPIC7.md`: Comprehensive testing guide (253 lines)
   - Customer lookup and creation testing
   - Step-by-step manual testing procedures
   - API testing examples
   - Error handling verification
   - UI/UX checklist
   - Troubleshooting section
4. `TESTING-EPIC8.md`: Comprehensive testing guide (394 lines)
   - Admin configuration testing
   - Backend API testing examples
   - Frontend UI testing procedures
   - RBAC verification
   - Integration testing scenarios
   - Database verification commands
   - Comprehensive checklists

**Code Documentation**:
- Minimal inline comments
- TypeScript type definitions provide self-documentation
- Function names are descriptive
- No JSDoc comments

**API Documentation**:
- No OpenAPI/Swagger specification
- Manual testing examples in TESTING documents
- Route definitions in code

**Total Lines of Code**: 2,643 lines (TypeScript/TSX)

---

## Summary Statistics

### Codebase Size
- Total TypeScript/TSX files: ~45 files
- Total lines of code: 2,643 lines
- Backend source files: 18 TypeScript files
- Frontend source files: 44 TypeScript/TSX files

### Database
- Tables: 6 (customers, staff_users, rewards, transactions, redemptions, loyalty_config)
- Migrations: 8 files
- Seed files: 1 file
- Foreign key constraints: 6 relationships

### API Endpoints
- Authentication: 3 endpoints (login, me, health)
- Customer: 2 endpoints (lookup, create)
- Transaction: 1 endpoint (purchase)
- Redemption: 2 endpoints (list rewards, redeem)
- Admin Config: 2 endpoints (get, update)
- Admin Rewards: 3 endpoints (create, update, toggle active)
- Admin Staff: 2 endpoints (list, toggle active)
- **Total**: 15 API endpoints

### Components
- Frontend React components: 24 components
- Pages: 5 pages (including admin)
- Services: 5 service classes
- Contexts: 1 context provider
- Custom hooks: 1 hook

### Dependencies
- Backend production: 9 packages
- Backend development: 6 packages
- Frontend production: 2 packages
- Frontend development: 9 packages

---

## Technology Versions Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Backend Runtime | Node.js | Not specified |
| Backend Language | TypeScript | 5.9.3 |
| Backend Framework | Express | 5.2.1 |
| Database | PostgreSQL | 16 |
| ORM | Sequelize | 6.37.7 |
| Authentication | jsonwebtoken | 9.0.3 |
| Password Hashing | bcryptjs | 3.0.2 |
| Security Headers | helmet | 8.1.0 |
| CORS | cors | 2.8.6 |
| HTTP Logging | morgan | 1.10.1 |
| Frontend Language | TypeScript | 5.9.3 |
| Frontend Framework | React | 19.2.0 |
| Build Tool | Vite | 7.2.4 |
| Linter | ESLint | 9.39.1 |
| Package Manager | Yarn | 4.9.1 |

---

## Repository Metadata

- **Repository Owner**: tahasharifi445-design
- **Repository Name**: bakery-loyalty
- **Primary Language**: TypeScript
- **Architecture**: Monorepo with separate backend and frontend
- **Development Approach**: Manual testing with comprehensive test documentation
- **Deployment**: Docker Compose for database, manual deployment for application
