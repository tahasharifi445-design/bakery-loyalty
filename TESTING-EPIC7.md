# Customer Lookup & Creation - Testing Instructions

This guide provides step-by-step instructions for testing the Customer Lookup and Creation feature.

## Prerequisites

1. **Backend Server Running**: Ensure the backend API is running on `http://localhost:4000`
2. **Frontend Server Running**: Ensure the frontend is running on `http://localhost:5173`
3. **Database Setup**: PostgreSQL database should be running with the required tables
4. **Test User**: You need a staff user account to log in

### Setting Up Test Environment

```bash
# Start the database
docker compose up -d

# Start the backend (in backend directory)
npm install
npm run dev

# Start the frontend (in frontend directory)
npm install
npm run dev
```

### Create a Test Staff User

If you don't have a staff user, create one in the database:

```sql
INSERT INTO staff_users (name, pin_hash, role) 
VALUES ('TestStaff', '$2b$10$KWcbgrMs728fdPUqriniduONvEeYcMbu8u.DiXNFmvk8MJtDsxw0u', 'staff');
-- PIN: 1234
```

---

## Test Workflow

### Step 1: Login

1. Navigate to `http://localhost:5173`
2. Enter your staff credentials:
   - Name: `TestStaff`
   - PIN: `1234`
3. Click "Login"

**Expected Result**: You should be redirected to the Home Screen showing your user information.

![Home Screen](https://github.com/user-attachments/assets/d0008c8e-83b9-41f3-8ac0-fdbb4356fc7a)

---

### Step 2: Navigate to Customer Lookup

1. On the Home Screen, click the **"Customer Lookup"** button

**Expected Result**: You should see the Customer Lookup page with a large phone number input field.

![Customer Lookup Page](https://github.com/user-attachments/assets/06c409b9-0da7-49af-949a-0d407d720de1)

---

### Step 3: Test Customer Lookup (Existing Customer)

1. Enter a phone number in the input field: `555-123-4567`
   - You can use spaces, dashes, or parentheses - they will be automatically removed
2. Click **"Look Up Customer"**

**Expected Result**: 
- The system normalizes the phone to `5551234567`
- If the customer exists, you'll see a Customer Summary Card displaying:
  - Customer Name
  - Phone Number
  - Points Balance

![Customer Found](https://github.com/user-attachments/assets/d27e1aaf-437c-468b-ae4c-cb5c217a5524)

---

### Step 4: Test Customer Not Found Flow

1. Clear the phone input and enter a new number: `555-999-8888`
2. Click **"Look Up Customer"**

**Expected Result**: 
- The system shows "Customer Not Found" message
- A create customer form appears with:
  - Pre-filled phone number (disabled)
  - Customer Name input field (enabled)
  - "Create Customer" button

![Customer Not Found](https://github.com/user-attachments/assets/444cf938-964f-478c-a5d7-7bef5852992e)

---

### Step 5: Test Customer Creation

1. In the "Customer Not Found" form, enter a name: `Jane Smith`
2. Click **"Create Customer"**

**Expected Result**:
- The system creates the new customer
- The create form disappears
- The Customer Summary Card immediately appears showing the newly created customer:
  - Name: Jane Smith
  - Phone: 5559998888
  - Points Balance: 0

![Customer Created Successfully](https://github.com/user-attachments/assets/63d524b9-40c6-498d-9dde-98977f09c4c3)

---

### Step 6: Test Phone Number Normalization

Test various phone number formats to ensure normalization works:

| Input Format | Normalized Output |
|--------------|-------------------|
| `555-123-4567` | `5551234567` |
| `(555) 123-4567` | `5551234567` |
| `555 123 4567` | `5551234567` |
| `555.123.4567` | `5551234567` |
| `+1-555-123-4567` | `15551234567` |

**Expected Result**: All formats should work and be normalized correctly before sending to the API.

---

### Step 7: Test Error Handling

#### Test Duplicate Customer Error

1. Try to create a customer with a phone number that already exists
2. Enter the phone number of an existing customer
3. Wait for "Customer Not Found" form
4. Enter a name and click "Create Customer"

**Expected Result**: Error message displays: "This customer already exists. Try looking up again."

#### Test Unauthorized Access

1. Clear your browser's local storage (or use incognito mode)
2. Try to navigate directly to the customer lookup page

**Expected Result**: You should be redirected to the login page

---

## Test Checklist

Use this checklist to verify all functionality:

- [ ] **Login Flow**
  - [ ] Can login with valid credentials
  - [ ] Invalid credentials show error message
  
- [ ] **Navigation**
  - [ ] "Customer Lookup" button appears on Home Screen
  - [ ] Clicking button navigates to Customer Lookup page
  - [ ] "← Back to Home" button returns to Home Screen
  
- [ ] **Customer Lookup**
  - [ ] Phone input accepts various formats
  - [ ] Phone normalization works correctly
  - [ ] Loading state displays during API call
  - [ ] Found customer shows summary card
  - [ ] Not found customer shows create form
  
- [ ] **Customer Creation**
  - [ ] Name input is required
  - [ ] Phone is pre-filled and disabled
  - [ ] Success shows customer summary card immediately
  - [ ] Duplicate customer shows appropriate error
  
- [ ] **Error Handling**
  - [ ] Unauthorized requests trigger logout
  - [ ] Network errors show error message
  - [ ] Error messages are clear and actionable
  
- [ ] **UI/UX**
  - [ ] Large touch targets (tablet-friendly)
  - [ ] Responsive design on different screen sizes
  - [ ] Consistent styling with login screen
  - [ ] All buttons have hover states
  - [ ] Loading states are clear

---

## Troubleshooting

### Issue: "Unauthorized" error when looking up customers

**Solution**: Your authentication token may have expired. Log out and log in again.

### Issue: "Customer not found" for a customer that exists

**Solution**: Check the phone number format in the database. The backend normalizes phone numbers, so ensure your database has matching normalized values.

### Issue: Customer creation fails with "Unexpected error"

**Solution**: Check the backend logs. Common causes:
- Database connection issues
- Missing database tables
- Invalid phone number format

### Issue: Page doesn't navigate when clicking "Customer Lookup"

**Solution**: 
- Clear browser cache and reload
- Check browser console for JavaScript errors
- Ensure React state is updating properly

---

## API Testing (Alternative Manual Test)

You can also test the APIs directly using curl:

### Login
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"TestStaff","pin":"1234"}' | jq -r '.token')
```

### Lookup Customer
```bash
curl -X POST http://localhost:4000/v1/customers/lookup \
  -H "Content-Type: application/json" \
  -H "Authorization: ******" \
  -d '{"phone":"5551234567"}'
```

### Create Customer
```bash
curl -X POST http://localhost:4000/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: ******" \
  -d '{"name":"Test Customer","phone":"5551234567"}'
```

---

## Notes

- Phone numbers are normalized by removing: spaces, dashes, parentheses, plus signs, and dots
- The system uses ****** token authentication
- Customer creation automatically displays the customer summary upon success
- All API calls handle 401 (Unauthorized) by logging the user out
- Points balance defaults to 0 for new customers
