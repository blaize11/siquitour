# Driver's License Verification + Per-Pax Pricing — Implementation Guide

**Status**: ✅ Ready to Deploy  
**Version**: 1.0  
**Date**: 2026-08-27

---

## 🚀 Quick Start (5 minutes)

### 1. Run Database Migrations

```bash
cd backend/laravel-api
php artisan migrate
```

**What this does**:
- Creates `guide_verification_documents` table
- Creates `guide_pax_prices` table
- Adds `verification_status` column to `tour_guide_profiles`
- Auto-approves existing verified guides for backward compatibility

### 2. Start Services

```bash
# Terminal 1: Laravel API
cd backend/laravel-api
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Mobile App
cd apps/mobile
npm run web

# Terminal 3: Admin Dashboard
cd apps/admin
npm run dev
```

### 3. Test Workflow

Follow the testing scenarios below.

---

## 📋 Testing Scenarios

### Scenario 1: New Guide Registration → Verification

**Goal**: Verify complete guide onboarding flow

**Steps**:

1. **Register as Tour Guide**
   - Visit mobile app at `http://localhost:8081`
   - Click "Register"
   - Fill in: Name, Email, Password
   - Select role: "Tour Guide" 🧭
   - Submit

2. **Verify Email**
   - Check terminal/logs for verification code
   - Enter code on verify screen
   - Should get "Email verified" message

3. **Check Verification Status**
   - Guide sees: "Tour Guide Verification" → "NOT SUBMITTED"
   - Big button: "Submit Driver's License"

4. **Upload Driver's License**
   - Click "Submit Driver's License"
   - Take/select a test image (PNG/JPG)
   - Enter license number: `DL12345678`
   - Enter expiry date: `2030-12-31`
   - Click "Submit"
   - Should get: "Successfully submitted" message

5. **Check Status (Guide)**
   - Should now show: "⏳ Verification In Progress"
   - Button: "Submitted" ✓

6. **Admin Reviews Application**
   - Visit admin: `http://localhost:3000`
   - Login as admin
   - Go to: "Guide Verifications"
   - Click on guide's application
   - See: License info, guide details
   - Click: "📥 Download License File" (verify image displays)
   - Two options:
     - ✓ Approve Guide
     - ✗ Reject Application (with reason)

7. **Approve Application**
   - Admin clicks "✓ Approve Guide"
   - Should get: "Approval successful" message
   - Audit log created

8. **Guide Sees Approval**
   - Guide refreshes app
   - Should see: "✅ Verification Approved!"
   - New buttons: "💰 Set Your Pricing" and "👤 Edit Profile"

**Expected Result**: ✅ Guide can now access pricing and profile management

---

### Scenario 2: Guide Sets Pricing

**Goal**: Verify per-pax pricing system

**Steps**:

1. **Add First Price**
   - Guide clicks: "💰 Set Your Pricing"
   - Click: "➕ Add Price"
   - Enter: 1 guest, ₱1,200
   - Click: "✓ Add Price"
   - Should see: "Price for 1 guest added!"

2. **Add Multiple Prices**
   - Click: "➕ Add Price"
   - Add: 2 guests, ₱2,000
   - Repeat for 3 guests (₱2,700) and 4 guests (₱3,200)

3. **View All Prices**
   - Pricing page shows:
     ```
     1 Guest  ₱1,200  [Edit] [Delete]
     2 Guests ₱2,000  [Edit] [Delete]
     3 Guests ₱2,700  [Edit] [Delete]
     4 Guests ₱3,200  [Edit] [Delete]
     ```

4. **Edit a Price**
   - Click [Edit] next to "2 Guests"
   - Change price: ₱2,200
   - Click: "✓ Update Price"
   - Should update to ₱2,200

5. **Delete a Price**
   - Click [Delete] next to "4 Guests"
   - Should remove from list

**Expected Result**: ✅ Pricing system works end-to-end

---

### Scenario 3: Guest Books Tour with Pricing

**Goal**: Verify booking uses correct pricing

**Steps**:

1. **Guest Browses Guides**
   - Login as guest
   - Go to "Explore"
   - Search for the guide we just verified

2. **See Pricing Options**
   - Guide details show:
     ```
     Pricing Options:
     ☐ 1 Guest   ₱1,200
     ☐ 2 Guests  ₱2,000
     ☐ 3 Guests  ₱2,700
     ```

3. **Create Booking**
   - Select: "2 Guests ₱2,000"
   - Pick date: tomorrow
   - Click: "Book Now"
   - Booking created with:
     - `pax_count`: 2
     - `total_price`: 2000 (locked from pax pricing)

4. **Verify Booking Shows Correct Price**
   - Booking details show: "₱2,000 for 2 guests"
   - Guide receives notification: "New booking request from [Guest]"

**Expected Result**: ✅ Pricing locked at booking time

---

### Scenario 4: Reject Application & Resubmit

**Goal**: Verify rejection workflow

**Steps**:

1. **Create New Guide (Different Email)**
   - Register as new tour guide
   - Verify email
   - Upload license

2. **Admin Rejects**
   - Admin goes to "Guide Verifications" → "Pending"
   - Click guide's application
   - Click: "✗ Reject Application"
   - Enter reason: "License image is unclear, please submit clearer photo"
   - Click: "Send Rejection"

3. **Guide Sees Rejection**
   - Guide's app shows: "❌ Application Rejected"
   - Shows reason: "License image is unclear..."
   - Button: "📤 Resubmit Application"

4. **Guide Resubmits**
   - Click: "📤 Resubmit Application"
   - Upload new license image
   - Status goes back to: "⏳ Verification In Progress"

5. **Admin Approves This Time**
   - Admin sees guide in "Pending" list again
   - Approve application

**Expected Result**: ✅ Rejection workflow works correctly

---

### Scenario 5: Security Tests

**Goal**: Verify sensitive data is protected

**Steps**:

1. **Guide Cannot See Other Guides' Licenses**
   - Guide A logs in
   - Tries to access: `/api/guide/verification/document` for another guide
   - Should get: 403 Forbidden

2. **Guest Cannot Download License**
   - Guest logs in
   - Tries to access: `/api/admin/guide-verifications/1/download-document`
   - Should get: 403 Forbidden

3. **License File Not Publicly Accessible**
   - Try direct access: `http://localhost:8000/storage/app/private/guide-licenses/1/license_xxx.jpg`
   - Should get: 404 Not Found (private storage not served)

4. **Price Cannot Be Manipulated in Booking**
   - Guest tries to POST booking with:
     ```json
     {
       "bookable_type": "guide",
       "bookable_id": 1,
       "pax_count": 2,
       "start_date": "2026-09-01",
       "price": 100
     }
     ```
   - Backend calculates: `price = guide_pax_prices[2].price` (₱2,000)
   - Booking stores: ₱2,000 (not ₱100)
   - Should succeed with correct price

**Expected Result**: ✅ All security checks pass

---

### Scenario 6: Backward Compatibility

**Goal**: Ensure existing guides still work

**Steps**:

1. **Existing Guide (Already Verified)**
   - Existing guide logs in
   - Goes to: "Guide Verifications"
   - Should see: "✅ Verification Approved!" (auto-approved on migration)
   - Can access pricing and bookings

2. **Booking Without New Pax Pricing**
   - Guide has old `rate_per_pax = 500`
   - No entries in `guide_pax_prices` table
   - Guest books 2 pax
   - Backend falls back to: `2 × 500 = 1000`
   - Booking succeeds with ₱1,000

3. **Booking With New Pax Pricing**
   - Same guide adds pax pricing: 2 pax = ₱2,000
   - Guest books 2 pax again
   - Backend uses: `guide_pax_prices[2].price = 2000`
   - Booking succeeds with ₱2,000 (new pricing wins)

**Expected Result**: ✅ Backward compatibility maintained

---

## 🧪 API Testing (Postman/Insomnia)

### Test Guide Verification Endpoints

**1. Submit License**
```
POST http://localhost:8000/api/guide/verification/submit
Headers: Authorization: Bearer {token}
Body: (multipart/form-data)
  - driver_license_file: (image file)
  - license_number: DL12345678
  - license_expiry_date: 2030-12-31

Expected: 201 with submission_status: "pending"
```

**2. Check Status**
```
GET http://localhost:8000/api/guide/verification/status
Headers: Authorization: Bearer {token}

Expected: 200 with status: "pending" | "approved" | "rejected"
```

**3. Add Price**
```
POST http://localhost:8000/api/guide/prices
Headers: Authorization: Bearer {token}
Body: {
  "pax_quantity": 2,
  "price": 2000
}

Expected: 201 with id, pax_quantity, price
```

**4. List Prices**
```
GET http://localhost:8000/api/guide/prices
Headers: Authorization: Bearer {token}

Expected: 200 with pax_prices: [...]
```

### Test Admin Endpoints

**1. List Verifications**
```
GET http://localhost:8000/api/admin/guide-verifications?status=pending
Headers: Authorization: Bearer {admin_token}

Expected: 200 with list of pending applications
```

**2. Approve Guide**
```
POST http://localhost:8000/api/admin/guide-verifications/{id}/approve
Headers: Authorization: Bearer {admin_token}

Expected: 200 with submission_status: "approved"
```

**3. Reject Guide**
```
POST http://localhost:8000/api/admin/guide-verifications/{id}/reject
Headers: Authorization: Bearer {admin_token}
Body: {
  "rejection_reason": "License image is unclear"
}

Expected: 200 with submission_status: "rejected"
```

---

## 🐛 Troubleshooting

### Migration Fails
**Problem**: "Column already exists"  
**Solution**: Migrations are safe to re-run; check if column was partially added
```bash
php artisan migrate:refresh  # Only in dev/test, NOT production!
```

### File Upload Fails
**Problem**: "File size must not exceed 5MB"  
**Solution**: Test with smaller image file (<5MB)

**Problem**: "Invalid MIME type"  
**Solution**: Ensure file is PNG, JPG, or PDF (check with `file` command)

### License File Not Downloadable
**Problem**: "File not found" or 404  
**Solution**: Check storage path is correct: `storage/app/private/guide-licenses/{user_id}/`

### Booking Price Wrong
**Problem**: Booking uses old `rate_per_pax` instead of new pax pricing  
**Solution**: Verify `guide_pax_prices` row exists for that pax quantity

### Admin Cannot See Verifications
**Problem**: Empty list or 403 error  
**Solution**: Ensure user has `role: admin` and is logged in with admin token

---

## 📊 Database Health Checks

### After Running Migrations

```sql
-- Check guide verification documents table
SELECT COUNT(*) as total_verifications, submission_status 
FROM guide_verification_documents 
GROUP BY submission_status;

-- Check guide pax prices table
SELECT tour_guide_id, pax_quantity, price 
FROM guide_pax_prices 
ORDER BY tour_guide_id, pax_quantity;

-- Check profiles with verification status
SELECT id, user_id, verification_status, is_verified 
FROM tour_guide_profiles 
LIMIT 10;
```

### Verify Soft Deletes

```sql
-- Check if soft deletes work (bookings table should have deleted_at)
SHOW COLUMNS FROM bookings WHERE Field = 'deleted_at';
```

---

## 🚢 Deployment Checklist

- [ ] Code reviewed and merged to main branch
- [ ] All migrations tested in staging
- [ ] Database backed up (production)
- [ ] File storage directory permissions set (775)
- [ ] `.env` configured for private storage path
- [ ] Admin user created (if not exists)
- [ ] Test guide verification workflow end-to-end
- [ ] Test booking with new pricing
- [ ] Monitor error logs for 24 hours
- [ ] Enable email notifications for admin approvals (future)

---

## 📞 Support

**Issues?** Check the audit report: `SIQUITOUR_AUDIT_REPORT.md`  
**Code questions?** Review the implementation memory: `memory/07-implementation-complete.md`

---

**Implementation by**: Claude Code  
**Version**: 1.0  
**Last Updated**: 2026-08-27
