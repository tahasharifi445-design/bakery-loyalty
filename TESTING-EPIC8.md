# EPIC 8 — Admin Configuration Testing Instructions

This guide provides step-by-step instructions for testing the Admin Configuration feature.

## Prerequisites

1. **Backend Server Running**: Ensure the backend API is running on `http://localhost:4000`
2. **Frontend Server Running**: Ensure the frontend is running on `http://localhost:5173`
3. **Database Setup**: PostgreSQL database should be running with the required tables
4. **Test Users**: You need both admin and staff user accounts

### Setting Up Test Environment

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

### Test Users Created by Seed

- **Admin User**
  - Name: `Admin`
  - PIN: `1234`
  - Role: `admin`

- **Staff User** (if you want to test RBAC, create via SQL):
```sql
INSERT INTO staff_users (id, name, role, is_active, pin_hash, created_at, updated_at)
VALUES (gen_random_uuid(), 'TestStaff', 'staff', true, '$2b$10$KWcbgrMs728fdPUqriniduONvEeYcMbu8u.DiXNFmvk8MJtDsxw0u', NOW(), NOW());
-- PIN: 1234
```

---

## Test Workflow

### Part 1: Backend API Testing

#### Test 1: Admin Authentication

```bash
# Login as admin
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","pin":"1234"}'
```

**Expected Result**: Returns JWT token with admin role.

#### Test 2: Admin Config Endpoints

```bash
# Save the token from login
TOKEN="your-jwt-token-here"

# GET config
curl -X GET http://localhost:4000/v1/admin/config \
  -H "Authorization: Bearer $TOKEN"

# UPDATE config
curl -X PUT http://localhost:4000/v1/admin/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"pointsPerDollar": 2.5}'
```

**Expected Result**: 
- GET returns current `pointsPerDollar` value
- PUT updates and returns new value

#### Test 3: RBAC Protection (Staff Cannot Access Admin Endpoints)

```bash
# Login as staff
STAFF_TOKEN=$(curl -s -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"TestStaff","pin":"1234"}' | jq -r '.token')

# Try to access admin endpoint
curl -X GET http://localhost:4000/v1/admin/config \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

**Expected Result**: Returns `{"error": "Forbidden"}` with status 403.

#### Test 4: Reward Management

```bash
# Create reward
curl -X POST http://localhost:4000/v1/admin/rewards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Free Coffee","requiredPoints":50}'

# Update reward (use reward ID from create response)
curl -X PUT http://localhost:4000/v1/admin/rewards/{reward-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Free Coffee Updated","requiredPoints":75}'

# Deactivate reward
curl -X PATCH http://localhost:4000/v1/admin/rewards/{reward-id}/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isActive":false}'

# Verify inactive rewards don't appear in public endpoint
curl -X GET http://localhost:4000/v1/rewards \
  -H "Authorization: Bearer $TOKEN"

# Verify admin can see all rewards (including inactive)
curl -X GET "http://localhost:4000/v1/rewards?includeInactive=true" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**:
- POST creates new reward and returns it
- PUT updates reward details
- PATCH deactivates reward
- GET /v1/rewards excludes inactive rewards
- GET /v1/rewards?includeInactive=true includes all rewards

#### Test 5: Staff Management

```bash
# List all staff
curl -X GET http://localhost:4000/v1/admin/staff \
  -H "Authorization: Bearer $TOKEN"

# Deactivate staff user (use staff ID from list)
curl -X PATCH http://localhost:4000/v1/admin/staff/{staff-id}/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isActive":false}'

# Try to login as deactivated staff
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"TestStaff","pin":"1234"}'
```

**Expected Result**:
- GET returns list of all staff users with their status
- PATCH deactivates user
- Login attempt returns `{"error": "User inactive"}` with status 403

---

### Part 2: Frontend UI Testing

#### Step 1: Login as Admin

1. Navigate to `http://localhost:5173`
2. Enter admin credentials:
   - Name: `Admin`
   - PIN: `1234`
3. Click "Login"

**Expected Result**: You should see the Home Screen with "Welcome, Admin!" and both "Customer Lookup" and "Admin Panel" buttons visible.

![Home Screen - Admin View](https://github.com/user-attachments/assets/6e32eff2-8364-4db8-950a-47c34a5f4f54)

#### Step 2: Access Admin Dashboard

1. On the Home Screen, click the **"Admin Panel"** button

**Expected Result**: You should be redirected to the Admin Dashboard with three tabs: Configuration, Rewards, and Staff.

#### Step 3: Test Configuration Tab

1. The Configuration tab should be active by default
2. Verify the current "Points Per Dollar" value is displayed
3. Change the value (e.g., to `3.0`)
4. Click "Update Configuration"

**Expected Result**: 
- Success message appears: "Configuration updated successfully!"
- The value is saved and persists

![Admin Dashboard - Configuration](https://github.com/user-attachments/assets/7001fab7-461e-4a15-a680-f62db73a3d68)

#### Step 4: Test Rewards Management

1. Click on the **"Rewards"** tab
2. Verify all rewards are listed with their status (Active/Inactive)
3. Click **"+ Create New Reward"**
4. Fill in:
   - Name: `Free Pastry`
   - Points Cost: `150`
5. Click "Create"

**Expected Result**: New reward appears in the table as Active.

![Admin Dashboard - Rewards](https://github.com/user-attachments/assets/2dd3107e-8ad0-4d32-926c-95c0bcecde5f)

6. Click **"Edit"** on an existing reward
7. Modify the name or points cost
8. Click "Save"

**Expected Result**: Reward is updated in the table.

9. Click **"Deactivate"** on an active reward
10. Confirm the action in the dialog

**Expected Result**: 
- Reward status changes to "Inactive"
- The "Deactivate" button changes to "Activate"

#### Step 5: Test Staff Management

1. Click on the **"Staff"** tab
2. Verify all staff users are listed with their roles and status
3. Find a staff user (not yourself if you're admin)
4. Click **"Deactivate"**
5. Confirm the action in the dialog

**Expected Result**: 
- Staff user status changes to "Inactive"
- The button changes to "Activate"

![Admin Dashboard - Staff](https://github.com/user-attachments/assets/224bf7cb-048b-4ea6-8470-4f29e7fbc4b3)

#### Step 6: Verify Staff Deactivation

1. Log out from the admin account
2. Try to login with the deactivated staff credentials

**Expected Result**: Login fails with error message: "User inactive"

#### Step 7: Test RBAC (Staff Cannot Access Admin Panel)

1. Activate the staff user again via admin panel
2. Log out from admin account
3. Login as staff user
4. On the Home Screen, verify **no "Admin Panel" button** is visible
5. Try to manually navigate to admin page (if routing allows)

**Expected Result**: 
- Admin Panel button is not visible for staff users
- If accessed directly, shows "403 - Forbidden" message

---

## Integration Testing

### Test 1: Config Update Affects Transactions

1. Login as admin
2. Update `pointsPerDollar` to `2.0`
3. Navigate back to home → Customer Lookup
4. Create or find a customer
5. Create a purchase for $10

**Expected Result**: Customer earns 20 points (10 × 2.0)

### Test 2: Reward Changes Reflect in Redemption

1. Login as admin
2. Create a new reward: "Test Reward" with 50 points
3. Navigate to Customer Lookup → Find a customer with ≥50 points
4. Go to Redemption page

**Expected Result**: The new "Test Reward" appears in the rewards list

5. Go back to Admin Panel → Rewards
6. Deactivate "Test Reward"
7. Go back to Redemption page

**Expected Result**: "Test Reward" no longer appears in the list

### Test 3: Config Persistence

1. Update `pointsPerDollar` to `1.5`
2. Logout and login again
3. Go to Admin Panel → Configuration

**Expected Result**: Value is still `1.5` (persisted in database)

---

## Verification Checklist

### Backend
- [x] Admin can access all `/v1/admin/*` endpoints
- [x] Staff cannot access `/v1/admin/*` endpoints (403 Forbidden)
- [x] Config GET returns current settings
- [x] Config PUT updates settings and persists to database
- [x] Config validation rejects invalid values (≤0 or >1000)
- [x] Reward creation works and returns created reward
- [x] Reward update works and modifies existing reward
- [x] Reward active/inactive toggle works
- [x] Inactive rewards are excluded from `/v1/rewards`
- [x] Inactive rewards are included with `?includeInactive=true`
- [x] Staff list returns all users with roles and status
- [x] Staff deactivation prevents login
- [x] Cannot deactivate self (returns 400 error)
- [x] Updated config affects transaction calculations

### Frontend
- [x] Admin Panel button visible only for admin users
- [x] Admin Panel button hidden for staff users
- [x] Admin Dashboard shows all three tabs
- [x] Configuration tab displays and updates settings
- [x] Rewards tab shows all rewards (including inactive)
- [x] Can create new rewards via UI
- [x] Can edit existing rewards via UI
- [x] Can toggle reward active/inactive status
- [x] Confirmation dialog appears for destructive actions
- [x] Staff tab shows all staff with roles and status
- [x] Can toggle staff active/inactive status
- [x] Deactivated staff cannot login
- [x] Staff role cannot access admin UI (403 page)
- [x] Tab navigation works correctly
- [x] Back to Home button works
- [x] UI is responsive and tablet-friendly

---

## Troubleshooting

### Issue: "Forbidden" error when accessing admin endpoints

**Solution**: 
- Ensure you're logged in as admin (role must be "admin")
- Check JWT token is valid and not expired
- Verify Authorization header is properly formatted: `Bearer {token}`

### Issue: Cannot deactivate staff user

**Solution**: 
- You cannot deactivate yourself
- Ensure the staff user exists in the database
- Check that you have admin privileges

### Issue: Config changes don't affect transactions

**Solution**: 
- Verify config update was successful via GET endpoint
- Check database `loyalty_config` table for updated value
- Ensure transaction calculation reads from database, not hardcoded values

### Issue: Rewards not appearing in redemption page

**Solution**: 
- Check reward `is_active` status in database
- Verify `/v1/rewards` endpoint returns active rewards only
- Clear browser cache and reload

---

## Database Verification Commands

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

---

## Notes

- All admin routes are protected with `requireAuth` + `requireRole(["admin"])` middleware
- JWT tokens contain role claims used for authorization
- Phone numbers are normalized by removing spaces, dashes, parentheses, etc.
- Points per dollar validation: must be > 0 and ≤ 1000
- Admin cannot deactivate their own account (safety measure)
- UI uses consistent color scheme and tablet-friendly design
- All changes are immediately reflected in the database
