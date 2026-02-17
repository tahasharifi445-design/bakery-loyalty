# Software Requirements Specification
## Bakery Loyalty Management System

**Version:** 1.0  
**Date:** February 17, 2026  
**Status:** Planned Requirements

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the planned functionality for the Bakery Loyalty Management System. This document defines all requirements that shall be implemented in the system.

The document serves as the authoritative reference for understanding system requirements, specifications, and expected behavior that the development team will implement.

### 1.2 Scope

The Bakery Loyalty Management System will be a point-of-sale integrated loyalty program management application designed to enable bakery staff to:

- Register and track customer loyalty accounts
- Record customer purchases and automatically calculate loyalty points
- Enable customers to redeem accumulated points for rewards
- Provide administrative controls for loyalty program configuration

The system will consist of a REST API backend service and a web-based frontend interface. The system will track customer purchase history, maintain point balances, manage a configurable rewards catalog, and provide role-based access control for staff and administrative users.

**Planned system capabilities:**
- Customer account management (creation and lookup)
- Purchase transaction processing with automatic points calculation
- Reward redemption processing with balance verification
- Loyalty program configuration (points-per-dollar rate)
- Rewards catalog management (creation, modification, activation/deactivation)
- Staff user management (viewing and activation/deactivation)
- Authentication and role-based authorization

**Out of scope for this release:**
- Customer self-service portal
- Email or SMS notifications
- Reporting or analytics dashboards
- Integration with external payment systems
- Inventory management
- Multi-location support
- Customer relationship management features

### 1.3 Intended Audience

This document is intended for:

- **Development Team:** Software engineers who will implement the system
- **Quality Assurance Personnel:** Testers who will validate system behavior against requirements
- **Project Stakeholders:** Business owners and product managers who need to understand planned capabilities
- **Academic Evaluators:** University instructors and teaching assistants assessing software engineering requirements analysis
- **System Designers:** Architects planning the technical implementation approach

---

## 2. Stakeholders

### 2.1 Primary Stakeholders

**Bakery Staff Users**
- Role: Front-line operators who will interact with customers
- Needs: Fast customer lookup, simple transaction recording, reward redemption processing
- Access Level: Standard authenticated access to core transactional features

**Bakery Administrators**
- Role: System administrators and program managers
- Needs: Control over loyalty program parameters, rewards catalog management, staff oversight
- Access Level: Elevated privileges for configuration and administrative functions

### 2.2 Secondary Stakeholders

**Bakery Customers**
- Role: Loyalty program participants
- Interaction: Indirect (through staff-mediated transactions)
- Benefit: Will earn and redeem loyalty points for rewards

**Development Team**
- Role: System implementers and maintainers
- Needs: Clear requirements specification for implementation

**Business Owner**
- Role: Strategic decision maker
- Needs: Understanding of planned system capabilities to meet business objectives

---

## 3. System Boundaries

### 3.1 In-Scope Functionality

The following capabilities will be implemented in the system:

**Customer Management:**
- Customer account creation with phone number identification
- Customer lookup by phone number
- Optional customer name storage
- Automatic points balance tracking

**Transaction Processing:**
- Purchase amount recording
- Automatic points calculation based on configurable rate
- Transaction history persistence
- Staff user attribution for audit trail

**Loyalty Points:**
- Points accumulation from purchases
- Points deduction from redemptions
- Real-time balance updates
- Integer-based points (no fractional points)

**Rewards Management:**
- Rewards catalog with name and point cost
- Reward activation/deactivation without deletion
- Reward listing with filtering by active status
- Reward modification (name and point cost updates)

**Administrative Configuration:**
- Configurable points-per-dollar earn rate
- Rate modification with immediate effect on future transactions
- Single global configuration record

**Staff Management:**
- Staff user listing
- Staff account activation/deactivation
- Role differentiation (staff vs. admin)

**Authentication & Authorization:**
- Name and PIN-based authentication
- JWT token issuance and validation
- Role-based access control
- Session persistence across page refreshes

### 3.2 Out-of-Scope Functionality

The following capabilities are explicitly **not planned** for implementation in this release:

**Customer Self-Service:**
- Customer-facing mobile or web application
- Self-service account registration
- Balance checking by customers
- Transaction history viewing by customers

**Communications:**
- Email notifications
- SMS notifications
- Push notifications
- Receipt generation

**Reporting & Analytics:**
- Transaction reports
- Customer activity dashboards
- Points expiration tracking
- Revenue analytics
- Popular rewards analysis

**Integration:**
- Point-of-sale system integration
- Payment gateway integration
- Third-party CRM integration
- External authentication providers

**Advanced Features:**
- Points expiration
- Tiered loyalty levels
- Birthday rewards
- Referral programs
- Location-specific rewards
- Time-limited promotions
- Bulk import/export functionality

**Multi-Tenancy:**
- Multiple location support
- Franchise management
- Per-location configuration
- Cross-location redemptions

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization

**FR-1:** The system shall authenticate staff users using a combination of name and numeric PIN.

**FR-2:** The system shall hash staff user PINs using bcrypt with cost factor 10 before storage.

**FR-3:** The system shall issue JWT tokens upon successful authentication containing user ID, role, and name.

**FR-4:** The system shall validate JWT tokens on all authenticated endpoints using the Bearer token scheme.

**FR-5:** The system shall reject authentication attempts for staff users with is_active status set to false.

**FR-6:** The system shall validate PIN format to be between 4 and 10 numeric digits.

**FR-7:** The system shall provide a mechanism for authenticated users to retrieve their own user information.

**FR-8:** The system shall restrict administrative endpoints to users with the "admin" role.

**FR-9:** The system shall allow users with "staff" or "admin" roles to access transaction and redemption endpoints.

### 4.2 Customer Management

**FR-10:** The system shall create new customer accounts with a required phone number and optional name.

**FR-11:** The system shall generate unique UUID identifiers for each customer account.

**FR-12:** The system shall enforce uniqueness of phone numbers across all customer accounts.

**FR-13:** The system shall normalize phone numbers by removing non-numeric characters during lookup operations.

**FR-14:** The system shall validate phone numbers to contain between 10 and 15 characters after normalization.

**FR-15:** The system shall initialize new customer accounts with a points balance of zero.

**FR-16:** The system shall provide customer lookup functionality by phone number.

**FR-17:** The system shall return customer details including name, phone number, and current points balance.

**FR-18:** The system shall return a 409 Conflict error when attempting to create a customer with an existing phone number.

### 4.3 Purchase Transactions

**FR-19:** The system shall record purchase transactions with customer ID, staff user ID, purchase amount, and timestamp.

**FR-20:** The system shall validate that purchase amounts are greater than zero.

**FR-21:** The system shall retrieve the current earn rate from the loyalty configuration before calculating points.

**FR-22:** The system shall calculate points earned by multiplying purchase amount by the earn rate and applying floor function to obtain an integer.

**FR-23:** The system shall store the calculated points earned value with each transaction record.

**FR-24:** The system shall atomically increment the customer's points balance by the calculated points earned.

**FR-25:** The system shall use database transactions to ensure atomicity of purchase recording and balance updates.

**FR-26:** The system shall prevent deletion of customer records that have associated transaction records.

**FR-27:** The system shall prevent deletion of staff user records that have associated transaction records.

**FR-28:** The system shall return transaction ID, points awarded, and new balance upon successful purchase recording.

### 4.4 Reward Management

**FR-29:** The system shall store rewards with a name, points cost, and active status indicator.

**FR-30:** The system shall limit reward names to a maximum of 120 characters.

**FR-31:** The system shall require points cost to be a positive integer value.

**FR-32:** The system shall allow administrators to create new rewards with specified name and points cost.

**FR-33:** The system shall default new rewards to active status.

**FR-34:** The system shall allow administrators to modify reward names and points costs for existing rewards.

**FR-35:** The system shall allow administrators to toggle reward active status without deleting the reward record.

**FR-36:** The system shall list active rewards by default when queried without filters.

**FR-37:** The system shall provide an option to include inactive rewards in reward listings.

**FR-38:** The system shall sort reward listings by points cost in ascending order.

### 4.5 Reward Redemption

**FR-39:** The system shall process reward redemptions by customer ID and reward ID.

**FR-40:** The system shall verify that the specified customer exists before processing redemption.

**FR-41:** The system shall verify that the specified reward exists before processing redemption.

**FR-42:** The system shall verify that the customer has sufficient points balance to cover the reward cost.

**FR-43:** The system shall reject redemptions with a 409 Conflict status when points balance is insufficient.

**FR-44:** The system shall create a redemption record with customer ID, reward ID, staff user ID, points spent, and timestamp.

**FR-45:** The system shall atomically decrement the customer's points balance by the reward's points cost.

**FR-46:** The system shall use database transactions to ensure atomicity of redemption recording and balance updates.

**FR-47:** The system shall prevent deletion of customer records that have associated redemption records.

**FR-48:** The system shall prevent deletion of reward records that have associated redemption records.

**FR-49:** The system shall prevent deletion of staff user records that have associated redemption records.

**FR-50:** The system shall return redemption ID, points deducted, and new balance upon successful redemption.

### 4.6 Loyalty Configuration

**FR-51:** The system shall maintain a single global loyalty configuration record.

**FR-52:** The system shall store an earn rate representing points awarded per dollar spent.

**FR-53:** The system shall default the earn rate to 1.0 points per dollar.

**FR-54:** The system shall allow administrators to retrieve the current earn rate configuration.

**FR-55:** The system shall allow administrators to update the earn rate to a new positive numeric value.

**FR-56:** The system shall validate that earn rate values are greater than 0 and less than or equal to 1000.

**FR-57:** The system shall apply updated earn rates to all subsequent purchase transactions immediately.

### 4.7 Staff User Management

**FR-58:** The system shall allow administrators to list all staff users.

**FR-59:** The system shall display staff user information including name, role, and active status.

**FR-60:** The system shall allow administrators to toggle staff user active status.

**FR-61:** The system shall prevent inactive staff users from authenticating.

### 4.8 Frontend User Interface

**FR-62:** The system shall provide a login screen requiring name and PIN entry.

**FR-63:** The system shall display a home dashboard showing authenticated user name, role, and user ID.

**FR-64:** The system shall provide navigation to customer lookup from the home dashboard.

**FR-65:** The system shall enable customer creation inline when a phone lookup returns no results.

**FR-66:** The system shall display current customer points balance after successful lookup or creation.

**FR-67:** The system shall provide navigation options to purchase recording or reward redemption after customer selection.

**FR-68:** The system shall display a purchase form accepting decimal amounts with two decimal places.

**FR-69:** The system shall display points awarded and new balance after successful purchase recording.

**FR-70:** The system shall display available active rewards with names and point costs during redemption flow.

**FR-71:** The system shall require confirmation via modal dialog before finalizing redemptions.

**FR-72:** The system shall display points deducted and new balance after successful redemption.

**FR-73:** The system shall display an admin panel button only to users with admin role.

**FR-74:** The system shall provide tabbed navigation within the admin panel for configuration, rewards, and staff management.

**FR-75:** The system shall display loading states during asynchronous operations.

**FR-76:** The system shall disable form inputs and buttons during loading states.

**FR-77:** The system shall display error messages when API operations fail.

**FR-78:** The system shall automatically logout users when authentication tokens expire or become invalid.

**FR-79:** The system shall persist authentication tokens in browser local storage for session continuity.

**FR-80:** The system shall validate authentication tokens on application initialization by calling the user information endpoint.

---

## 5. Business Rules

### 5.1 Points Calculation

**BR-1:** Points earned from purchases shall be calculated as: `floor(purchase_amount * earn_rate)`

**BR-2:** Fractional points shall be discarded; only integer point values shall be awarded.

**BR-3:** The earn rate shall be configurable but must remain between 0 (exclusive) and 1000 (inclusive).

**BR-4:** Negative purchase amounts shall be rejected.

**BR-5:** Zero or negative point costs for rewards shall be rejected.

### 5.2 Balance Management

**BR-6:** Customer points balances shall never be permitted to become negative.

**BR-7:** Redemptions shall be rejected if the customer's current balance is less than the reward's point cost.

**BR-8:** Balance updates from purchases and redemptions shall be atomic to prevent race conditions.

**BR-9:** Customer points balances shall default to zero upon account creation.

### 5.3 Account and Record Management

**BR-10:** Phone numbers shall be unique identifiers for customers; duplicate phone numbers shall be prohibited.

**BR-11:** Customer accounts, rewards, and staff users shall not be physically deleted if they have associated transaction or redemption records.

**BR-12:** Inactive staff users shall be prevented from authenticating but their historical transaction records shall be preserved.

**BR-13:** Inactive rewards shall be retained in the system but excluded from default listings.

### 5.4 Authentication and Authorization

**BR-14:** Only authenticated users shall access transaction, redemption, and administrative endpoints.

**BR-15:** Only users with "admin" role shall modify loyalty configuration, manage rewards, or manage staff accounts.

**BR-16:** Both "staff" and "admin" roles shall have access to customer management, purchases, and redemptions.

**BR-17:** Staff users shall authenticate using a PIN between 4 and 10 numeric digits.

**BR-18:** PIN hashes shall be stored using bcrypt with cost factor 10.

### 5.5 Data Integrity

**BR-19:** All foreign key relationships shall enforce referential integrity with RESTRICT on delete operations.

**BR-20:** Update operations on referenced records shall CASCADE to dependent records.

**BR-21:** Customer IDs, reward IDs, staff user IDs, transaction IDs, and redemption IDs shall be UUIDs generated using PostgreSQL's gen_random_uuid() function.

**BR-22:** Timestamps for creation and modification shall be automatically maintained for all entity records.

---

## 6. Non-Functional Requirements

### 6.1 Security

**NFR-1:** The system shall hash all staff user PINs using bcrypt algorithm with cost factor 10 before database storage.

**NFR-2:** The system shall never store PINs in plaintext.

**NFR-3:** The system shall use JWT tokens for session management with signatures verified using a secret key.

**NFR-4:** The system shall validate JWT tokens on every authenticated request.

**NFR-5:** The system shall include security headers in HTTP responses using helmet middleware.

**NFR-6:** The system shall enforce CORS policy to restrict cross-origin requests.

**NFR-7:** The system shall validate all user inputs before processing to prevent injection attacks.

**NFR-8:** The system shall use parameterized queries through ORM layer to prevent SQL injection.

**NFR-9:** The system shall return generic error messages to clients without exposing sensitive implementation details.

**NFR-10:** The system shall log detailed error information server-side for debugging while returning sanitized messages to clients.

**NFR-11:** The system shall store authentication tokens in browser local storage with appropriate security considerations.

### 6.2 Performance

**NFR-12:** The system shall use database indexes on customer_id and created_at columns for transaction and redemption tables to optimize query performance.

**NFR-13:** The system shall use database transactions for all operations that modify multiple records to ensure atomicity.

**NFR-14:** The system shall retrieve loyalty configuration once per purchase transaction rather than caching to ensure current rates are applied.

**NFR-15:** The system shall limit API response payloads to necessary data fields to minimize network overhead.

### 6.3 Reliability

**NFR-16:** The system shall use database transactions with automatic rollback on error to maintain data consistency.

**NFR-17:** The system shall ensure purchase transactions either fully complete (record transaction and update balance) or fully roll back.

**NFR-18:** The system shall ensure redemption transactions either fully complete (record redemption and update balance) or fully roll back.

**NFR-19:** The system shall validate referential integrity through foreign key constraints to prevent orphaned records.

**NFR-20:** The system shall enforce ON DELETE RESTRICT for foreign keys to prevent cascade deletion of dependent data.

**NFR-21:** The system shall handle concurrent purchase or redemption operations for the same customer safely through database transaction isolation.

### 6.4 Usability

**NFR-22:** The system shall normalize phone number input by removing spaces, dashes, and other non-numeric characters.

**NFR-23:** The system shall provide immediate validation feedback for invalid form inputs.

**NFR-24:** The system shall require explicit confirmation before processing redemptions.

**NFR-25:** The system shall display loading indicators during asynchronous operations to inform users of progress.

**NFR-26:** The system shall disable interactive controls during loading states to prevent duplicate submissions.

**NFR-27:** The system shall display success messages with transaction results (points awarded, new balance).

**NFR-28:** The system shall automatically return users to appropriate screens after completing transactions.

**NFR-29:** The system shall optimize mobile input by setting appropriate input modes for numeric fields.

**NFR-30:** The system shall persist user sessions across page refreshes by validating stored tokens.

### 6.5 Maintainability

**NFR-31:** The system shall use TypeScript for type safety in both frontend and backend code.

**NFR-32:** The system shall separate concerns through modular architecture (routes, models, middleware).

**NFR-33:** The system shall use environment variables for configuration parameters such as JWT secret and database credentials.

**NFR-34:** The system shall use database migrations for schema management to enable version control of database changes.

**NFR-35:** The system shall provide seed data scripts for initial system setup.

### 6.6 Scalability

**NFR-36:** The system shall use connection pooling for database connections.

**NFR-37:** The system shall use UUID primary keys to enable distributed ID generation if needed.

**NFR-38:** The system shall design API endpoints to be stateless, storing all session state in JWT tokens.

---

## 7. Data Requirements

### 7.1 Data Entities

#### 7.1.1 Customer

**Purpose:** Stores customer account information and loyalty points balance.

**Attributes:**
- `id` (UUID, Primary Key, Auto-generated)
- `phone_number` (String[20], Not Null, Unique)
- `name` (String[100], Nullable)
- `points_balance` (Integer, Not Null, Default: 0)
- `created_at` (Timestamp, Not Null, Auto-set)
- `updated_at` (Timestamp, Not Null, Auto-updated)

**Constraints:**
- Primary key uniqueness enforced on `id`
- Unique constraint enforced on `phone_number`
- `points_balance` must be non-negative (enforced by application logic)

#### 7.1.2 Staff User

**Purpose:** Stores staff and administrator account information for authentication.

**Attributes:**
- `id` (UUID, Primary Key, Auto-generated)
- `name` (String[100], Not Null)
- `pin_hash` (String[255], Not Null)
- `role` (ENUM['staff', 'admin'], Not Null, Default: 'staff')
- `is_active` (Boolean, Not Null, Default: true)
- `created_at` (Timestamp, Not Null, Auto-set)
- `updated_at` (Timestamp, Not Null, Auto-updated)

**Constraints:**
- Primary key uniqueness enforced on `id`
- `role` must be one of 'staff' or 'admin'
- `pin_hash` stores bcrypt hash, not plaintext PIN

#### 7.1.3 Transaction

**Purpose:** Records customer purchase transactions and associated points earned.

**Attributes:**
- `id` (UUID, Primary Key, Auto-generated)
- `customer_id` (UUID, Not Null, Foreign Key → customers.id)
- `staff_user_id` (UUID, Not Null, Foreign Key → staff_users.id)
- `amount` (Decimal[10,2], Not Null)
- `points_earned` (Integer, Not Null)
- `created_at` (Timestamp, Not Null, Auto-set)
- `updated_at` (Timestamp, Not Null, Auto-updated)

**Constraints:**
- Foreign key `customer_id` references `customers.id` (ON DELETE RESTRICT, ON UPDATE CASCADE)
- Foreign key `staff_user_id` references `staff_users.id` (ON DELETE RESTRICT, ON UPDATE CASCADE)
- Index on (`customer_id`, `created_at`) for query optimization
- `amount` must be positive (enforced by application logic)

#### 7.1.4 Reward

**Purpose:** Defines available rewards in the loyalty program catalog.

**Attributes:**
- `id` (UUID, Primary Key, Auto-generated)
- `name` (String[120], Not Null)
- `points_cost` (Integer, Not Null)
- `is_active` (Boolean, Not Null, Default: true)
- `created_at` (Timestamp, Not Null, Auto-set)
- `updated_at` (Timestamp, Not Null, Auto-updated)

**Constraints:**
- Primary key uniqueness enforced on `id`
- `points_cost` must be positive (enforced by application logic)

#### 7.1.5 Redemption

**Purpose:** Records reward redemption transactions and associated points spent.

**Attributes:**
- `id` (UUID, Primary Key, Auto-generated)
- `customer_id` (UUID, Not Null, Foreign Key → customers.id)
- `reward_id` (UUID, Not Null, Foreign Key → rewards.id)
- `staff_user_id` (UUID, Not Null, Foreign Key → staff_users.id)
- `points_spent` (Integer, Not Null)
- `created_at` (Timestamp, Not Null, Auto-set)
- `updated_at` (Timestamp, Not Null, Auto-updated)

**Constraints:**
- Foreign key `customer_id` references `customers.id` (ON DELETE RESTRICT, ON UPDATE CASCADE)
- Foreign key `reward_id` references `rewards.id` (ON DELETE RESTRICT, ON UPDATE CASCADE)
- Foreign key `staff_user_id` references `staff_users.id` (ON DELETE RESTRICT, ON UPDATE CASCADE)
- Index on (`customer_id`, `created_at`) for query optimization

#### 7.1.6 Loyalty Configuration

**Purpose:** Stores global loyalty program parameters.

**Attributes:**
- `id` (Integer, Primary Key, Auto-increment)
- `earn_rate` (Decimal[10,4], Not Null, Default: 1.0)
- `created_at` (Timestamp, Not Null, Auto-set)
- `updated_at` (Timestamp, Not Null, Auto-updated)

**Constraints:**
- Intended to contain a single record for global configuration
- `earn_rate` must be greater than 0 and less than or equal to 1000 (enforced by application logic)

### 7.2 Relationships

**Customer → Transaction (One-to-Many)**
- One customer may have zero or many transactions
- Each transaction belongs to exactly one customer
- Deletion restricted to maintain transaction history

**Staff User → Transaction (One-to-Many)**
- One staff user may have processed zero or many transactions
- Each transaction is processed by exactly one staff user
- Deletion restricted to maintain transaction attribution

**Customer → Redemption (One-to-Many)**
- One customer may have zero or many redemptions
- Each redemption belongs to exactly one customer
- Deletion restricted to maintain redemption history

**Reward → Redemption (One-to-Many)**
- One reward may have been redeemed zero or many times
- Each redemption involves exactly one reward
- Deletion restricted to maintain redemption history

**Staff User → Redemption (One-to-Many)**
- One staff user may have processed zero or many redemptions
- Each redemption is processed by exactly one staff user
- Deletion restricted to maintain redemption attribution

### 7.3 Data Integrity Rules

**DI-1:** All foreign key relationships shall enforce referential integrity.

**DI-2:** Deletion of parent records (customers, rewards, staff users) shall be prevented (RESTRICT) if dependent records (transactions, redemptions) exist.

**DI-3:** Updates to primary keys shall cascade to foreign keys in dependent records.

**DI-4:** UUID primary keys shall be generated using PostgreSQL's `gen_random_uuid()` function.

**DI-5:** Timestamp fields shall automatically capture current time on record creation and update.

**DI-6:** Phone numbers shall be unique across all customer records.

**DI-7:** Role values for staff users shall be constrained to 'staff' or 'admin' via database ENUM type.

---

## 8. Assumptions and Constraints

### 8.1 Technical Assumptions

**A-1:** The system assumes availability of PostgreSQL 16 or compatible version.

**A-2:** The system assumes the pgcrypto extension is available for UUID generation.

**A-3:** The system assumes a single-database deployment without sharding.

**A-4:** The system assumes the frontend and backend are deployed within the same network context or CORS is appropriately configured.

**A-5:** The system assumes environment variables are properly configured before deployment (JWT_SECRET, database credentials).

**A-6:** The system assumes synchronous communication between frontend and backend without message queues.

### 8.2 Business Assumptions

**A-7:** The system assumes customers can be uniquely identified by phone number.

**A-8:** The system assumes staff mediation for all customer transactions; customers do not directly interact with the system.

**A-9:** The system assumes a single loyalty program configuration applies globally to all customers.

**A-10:** The system assumes rewards are non-physical or fulfillment is managed externally.

**A-11:** The system assumes points have no expiration date.

**A-12:** The system assumes all monetary transactions are in a single currency.

### 8.3 Architectural Constraints

**C-1:** The system is constrained to a monolithic architecture with separate frontend and backend codebases.

**C-2:** The backend is constrained to use Express.js framework with TypeScript.

**C-3:** The frontend is constrained to use React with TypeScript and Vite build tooling.

**C-4:** The system shall use an ORM (Object-Relational Mapping) framework for database access.

**C-5:** The system is constrained to REST API communication pattern using JSON payloads.

**C-6:** The system is constrained to JWT-based authentication without refresh token rotation.

### 8.4 Deployment Constraints

**C-7:** The system requires PostgreSQL database server accessible from the backend service.

**C-8:** The system requires environment variable configuration for sensitive parameters.

**C-9:** The system requires Docker or compatible container runtime for database deployment via docker-compose.

**C-10:** The backend service must be started after database migrations and seeding are complete.

**C-11:** The frontend build process requires Node.js and compatible package manager (npm or yarn).

### 8.5 Security Constraints

**C-12:** The system is constrained to use bcrypt for password hashing (cost factor 10).

**C-13:** The system is constrained to use symmetric key JWT signing (HMAC with SHA-256).

**C-14:** The system stores authentication tokens in browser local storage, which is vulnerable to XSS attacks.

**C-15:** The system does not implement rate limiting or brute force protection.

### 8.6 Operational Constraints

**C-16:** The system requires manual database migration execution during deployment.

**C-17:** The system requires manual execution of seed scripts for initial data population.

**C-18:** The system does not provide automated backup or disaster recovery mechanisms.

**C-19:** The system does not provide monitoring, logging aggregation, or alerting infrastructure.

---

## 9. Requirements Traceability Matrix

This section maps each functional requirement to the planned implementation modules and verification approach. This matrix will be used during development to ensure all requirements are properly implemented and tested.

### 9.1 Authentication & Authorization (FR-1 to FR-9)

| Requirement | Planned Module | Verification Method |
|------------|----------------|---------------------|
| FR-1 | Authentication routes module | Verify login endpoint validates name and PIN |
| FR-2 | User credential storage | Verify bcrypt hashing with cost factor 10 |
| FR-3 | Authentication routes module | Verify JWT payload contains sub, role, name |
| FR-4 | Authentication middleware | Verify Bearer token validation on protected endpoints |
| FR-5 | Authentication routes module | Verify inactive users cannot authenticate |
| FR-6 | Authentication routes module | Verify PIN regex validation `/^\d{4,10}$/` |
| FR-7 | Authentication routes module | Verify GET /v1/auth/me endpoint returns user info |
| FR-8 | Authorization middleware | Verify requireRole middleware enforces admin access |
| FR-9 | Main server configuration | Verify middleware applied to transaction/redemption routes |

### 9.2 Customer Management (FR-10 to FR-18)

| Requirement | Planned Module | Verification Method |
|------------|----------------|---------------------|
| FR-10 | Customer routes module | Verify POST /v1/customers endpoint creates customer |
| FR-11 | Database schema | Verify UUID primary keys generated automatically |
| FR-12 | Database schema | Verify phone_number unique constraint enforced |
| FR-13 | Phone utility module | Verify normalizePhoneNumber removes non-digits |
| FR-14 | Customer routes module | Verify phone length validation (10-15 chars) |
| FR-15 | Database schema | Verify points_balance defaults to 0 |
| FR-16 | Customer routes module | Verify POST /v1/customers/lookup finds by phone |
| FR-17 | Customer routes module | Verify response includes name, phone, points |
| FR-18 | Customer routes module | Verify 409 error on duplicate phone number |

### 9.3 Purchase Transactions (FR-19 to FR-28)

| Requirement | Planned Module | Verification Method |
|------------|----------------|---------------------|
| FR-19 | Transaction routes module | Verify transaction record includes all required fields |
| FR-20 | Transaction routes module | Verify purchase amount validation rejects <= 0 |
| FR-21 | Transaction routes module | Verify system retrieves current earn rate before calculation |
| FR-22 | Transaction routes module | Verify Math.floor(amount * earnRate) calculation |
| FR-23 | Transaction routes module | Verify points_earned stored in transaction record |
| FR-24 | Transaction routes module | Verify customer points_balance atomically incremented |
| FR-25 | Transaction routes module | Verify database transaction wrapper ensures atomicity |
| FR-26 | Database schema | Verify foreign key ON DELETE RESTRICT for customer_id |
| FR-27 | Database schema | Verify foreign key ON DELETE RESTRICT for staff_user_id |
| FR-28 | Transaction routes module | Verify response includes transactionId, pointsAwarded, newBalance |

### 9.4 Reward Management (FR-29 to FR-38)

| Requirement | Planned Module | Verification Method |
|------------|----------------|---------------------|
| FR-29 | Database schema | Verify rewards table has name, points_cost, is_active |
| FR-30 | Database schema | Verify name field limited to 120 characters |
| FR-31 | Admin rewards routes | Verify points cost validation rejects non-positive values |
| FR-32 | Admin rewards routes | Verify POST /v1/admin/rewards creates reward |
| FR-33 | Database schema | Verify is_active defaults to true |
| FR-34 | Admin rewards routes | Verify PUT /v1/admin/rewards/:id updates reward |
| FR-35 | Admin rewards routes | Verify PATCH /v1/admin/rewards/:id/active toggles status |
| FR-36 | Redemption routes module | Verify default query returns only active rewards |
| FR-37 | Redemption routes module | Verify includeInactive parameter includes all rewards |
| FR-38 | Redemption routes module | Verify rewards ordered by points_cost ascending |

### 9.5 Reward Redemption (FR-39 to FR-50)

| Requirement | Planned Module | Verification Method |
|------------|----------------|---------------------|
| FR-39 | Redemption routes module | Verify endpoint accepts customerId and rewardId |
| FR-40 | Redemption routes module | Verify customer existence validated before redemption |
| FR-41 | Redemption routes module | Verify reward existence validated before redemption |
| FR-42 | Redemption routes module | Verify sufficient points balance checked |
| FR-43 | Redemption routes module | Verify 409 error returned for insufficient points |
| FR-44 | Redemption routes module | Verify redemption record created with all fields |
| FR-45 | Redemption routes module | Verify customer points_balance atomically decremented |
| FR-46 | Redemption routes module | Verify database transaction wrapper ensures atomicity |
| FR-47 | Database schema | Verify foreign key ON DELETE RESTRICT for customer_id |
| FR-48 | Database schema | Verify foreign key ON DELETE RESTRICT for reward_id |
| FR-49 | Database schema | Verify foreign key ON DELETE RESTRICT for staff_user_id |
| FR-50 | Redemption routes module | Verify response includes redemptionId, pointsDeducted, newBalance |

### 9.6 Loyalty Configuration (FR-51 to FR-57)

| Requirement | Planned Module | Verification Method |
|------------|----------------|---------------------|
| FR-51 | Database schema | Verify single loyalty_config record design |
| FR-52 | Database schema | Verify earn_rate field exists with appropriate precision |
| FR-53 | Database schema | Verify earn_rate defaults to 1.0 |
| FR-54 | Admin config routes | Verify GET /v1/admin/config returns earn rate |
| FR-55 | Admin config routes | Verify PUT /v1/admin/config updates earn rate |
| FR-56 | Admin config routes | Verify validation: 0 < rate <= 1000 |
| FR-57 | Transaction routes module | Verify config read on each transaction for current rate |

### 9.7 Staff User Management (FR-58 to FR-61)

| Requirement | Planned Module | Verification Method |
|------------|----------------|---------------------|
| FR-58 | Admin staff routes | Verify GET /v1/admin/staff lists all staff users |
| FR-59 | Admin staff routes | Verify response includes name, role, is_active |
| FR-60 | Admin staff routes | Verify PATCH /v1/admin/staff/:id/active toggles status |
| FR-61 | Authentication routes module | Verify is_active check blocks inactive users from login |

### 9.8 Frontend User Interface (FR-62 to FR-80)

| Requirement | Planned Module | Verification Method |
|------------|----------------|---------------------|
| FR-62 | Login screen component | Verify login form with name and PIN inputs |
| FR-63 | Home screen component | Verify dashboard shows user name, role, ID |
| FR-64 | Home screen component | Verify navigation to customer lookup |
| FR-65 | Customer lookup component | Verify inline customer creation when not found |
| FR-66 | Customer lookup component | Verify points balance displayed after lookup |
| FR-67 | Customer lookup component | Verify purchase and redemption action buttons |
| FR-68 | Purchase page component | Verify decimal amount input with 2 decimal places |
| FR-69 | Purchase page component | Verify success message shows points awarded and new balance |
| FR-70 | Redemption page component | Verify active rewards list with names and costs |
| FR-71 | Redemption page component | Verify confirmation modal before redemption |
| FR-72 | Redemption page component | Verify success shows points deducted and new balance |
| FR-73 | Home screen component | Verify admin panel button only for admin role |
| FR-74 | Admin dashboard component | Verify tabs for config, rewards, staff |
| FR-75 | All async components | Verify loading states during API calls |
| FR-76 | All form components | Verify inputs disabled during loading |
| FR-77 | All components with API calls | Verify error messages displayed on failures |
| FR-78 | Authentication context | Verify automatic logout on 401 errors |
| FR-79 | Authentication context | Verify token persisted in localStorage |
| FR-80 | Authentication context | Verify token validation on app initialization |

---

## Appendix A: Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 17, 2026 | Requirements Analyst | Initial planned requirements specification |

---

## Appendix B: Glossary

**bcrypt:** A password hashing function based on the Blowfish cipher, designed to be computationally expensive to resist brute-force attacks.

**Cost Factor:** A parameter in bcrypt that determines the number of iterations, affecting computational cost and security strength.

**CORS (Cross-Origin Resource Sharing):** A security mechanism that allows web pages to make requests to a different domain than the one serving the web page.

**JWT (JSON Web Token):** A compact, URL-safe token format for securely transmitting information between parties as a JSON object.

**ORM (Object-Relational Mapping):** A technique that connects object-oriented program code with relational database systems, allowing interaction with databases using object-oriented paradigms.

**PIN (Personal Identification Number):** A numeric password used for authentication, in this system constrained to 4-10 digits.

**RESTRICT (Foreign Key Constraint):** A referential action that prevents deletion of a parent record if dependent child records exist.

**UUID (Universally Unique Identifier):** A 128-bit identifier that is globally unique without requiring a central registration authority.

---

## Appendix C: Planned System Architecture

This requirements specification defines the intended functionality for the Bakery Loyalty Management System. The system will be implemented using the following architectural approach:

**Repository:** tahasharifi445-design/bakery-loyalty

**Planned Module Structure:**
- Backend API: REST endpoints in route modules
- Database Models: ORM entity definitions
- Database Migrations: Schema version control
- Authentication Middleware: JWT validation and role enforcement
- Frontend Components: React-based user interface
- Frontend Services: API client layer

**Technology Stack:**
- Backend: Node.js with TypeScript
- Database: PostgreSQL with UUID support
- Frontend: React with TypeScript
- Authentication: JWT with bcrypt password hashing
- API Communication: RESTful JSON over HTTPS

---

**End of Document**
