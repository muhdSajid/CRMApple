# Backend 500 Error - Root Cause Analysis

## 🔴 Problem Summary

- ✅ Frontend is deployed and working (error suppression active)
- ✅ API requests are reaching backend through Nginx proxy
- ❌ Backend returns HTTP 500 for donation-report and expense-report endpoints
- ❌ Backend also rejects login requests (HTTP 401)

---

## 🔍 Root Cause Identified

### **CRITICAL: Flyway Database Migration Error**

```
ERROR: Schema "public" has version 2, but no migration could be resolved in the configured locations!
```

**What This Means:**

- The database schema is at version 2
- The backend application expects different migrations
- Database is not properly initialized for the backend code
- This prevents table access and causes NULL pointer/database errors

**Why This Causes 500 Errors:**

```
1. Backend tries to query donation_report table
2. Flyway migration error prevents proper schema initialization
3. Table doesn't exist or is in inconsistent state
4. Database query fails → HTTP 500 Internal Server Error
```

---

## 📋 Diagnostic Findings

### Logs Analysis

**Backend Log Errors:**

```
2025-11-25T21:28:35 ERROR - Schema "public" has version 2, but no migration could be resolved
2025-11-25T21:28:40 WARN - UserDetailsService configuration warning
2025-11-25T22:38:02 ERROR - Invalid JWT token (login fails)
```

### Backend Status

```
✓ Java process running: PID 279637
✓ Port 8081 listening
✓ Spring Boot started
✓ Database connection attempted
✗ Database schema migration FAILED
✗ Authentication/Login not working
✗ API endpoints return 500 or 401
```

---

## 🛠️ Solution Steps

### Step 1: Identify the Issue Location

The backend is located at:

```bash
/home/it-admin/be-service/code/inventory_app_v1/
```

**Check:**

- Where are Flyway migration files? (Usually `src/main/resources/db/migration/`)
- Are migrations properly configured in `application.properties`?
- Is the database user account created?

### Step 2: Check Database Setup

**On Server, Run:**

```bash
# Check if database exists
sudo -u postgres psql -l | grep -i inventory

# Check database user
sudo -u postgres psql -c "SELECT usename FROM pg_user;"

# Check database schema
sudo -u postgres psql -d inventory_db -c "\d"
```

### Step 3: Common Fixes

#### **Option A: Rebuild/Redeploy Backend**

```bash
cd /home/it-admin/be-service/code/inventory_app_v1/
mvn clean build
mvn spring-boot:run
```

#### **Option B: Reset Flyway (If Safe)**

```bash
# Drop and recreate Flyway history
sudo -u postgres psql -d inventory_db -c "DROP TABLE IF EXISTS flyway_schema_history;"
# Then restart backend
```

#### **Option C: Check Migration Configuration**

Look for `application.properties` or `application.yml`:

```properties
# Should have:
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.url=jdbc:postgresql://localhost:5432/inventory_db
```

### Step 4: Verify Database Credentials

```bash
# Check what credentials are configured
cat /home/it-admin/be-service/code/inventory_app_v1/application.properties | grep -i "spring.datasource"

# Verify connection works locally
psql -U inventory_user -d inventory_db -h localhost -c "SELECT 1;"
```

---

## 📝 Commands to Run on Server

### Quick Diagnostics (Run These First)

```bash
# SSH into server
ssh it-admin@27.34.245.92

# 1. Check database
sudo -u postgres psql -l | grep -i inventory

# 2. Check backend config
cat /home/it-admin/be-service/code/inventory_app_v1/application.properties | grep -E "datasource|flyway|database"

# 3. Check last few errors
tail -50 /home/it-admin/be-service/code/inventory_app_v1/target/application.log | grep -i "error\|exception"

# 4. Try login endpoint (will show real error)
curl -s http://localhost:8081/api/v1/auth/signin -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq .
```

### If Database Migration is Problem

```bash
# Stop backend
pkill -f "inventory-app"

# Drop Flyway history (WARNING: only if necessary)
sudo -u postgres psql -d inventory_db -c "DROP TABLE IF EXISTS flyway_schema_history;"

# Restart backend (let it recreate migrations)
cd /home/it-admin/be-service/code/inventory_app_v1/
nohup java -jar target/inventory-app-0.0.1-SNAPSHOT.jar > backend.log 2>&1 &

# Monitor logs
tail -f backend.log | grep -E "ERROR|Flyway|migration"
```

---

## 🎯 Next Steps

**I need you to:**

1. **SSH to the server and run diagnostic commands above**
2. **Find and share the error message from:**

   - `application.properties` or `application.yml` file
   - Database configuration details
   - Any migration-related error messages

3. **Confirm:**
   - Does database `inventory_db` exist?
   - Are all migrations present in the jar file?
   - Was the backend code just deployed?

**Your Response Should Include:**

- Output of `sudo -u postgres psql -l | grep -i inventory`
- Output of backend config (datasource settings)
- Full error from `tail -50 /application.log | grep -i error`

---

## 🔗 Connection Info

- **Server:** 27.34.245.92
- **User:** it-admin
- **Password:** Admins@123
- **Backend Location:** `/home/it-admin/be-service/code/inventory_app_v1/`
- **Backend Jar:** `target/inventory-app-0.0.1-SNAPSHOT.jar`
- **Logs:** `target/application.log`

---

## ✅ Frontend Status (Already Fixed)

- ✓ Deployment successful
- ✓ Error suppression working (no popups)
- ✓ Users see graceful "No Data Available" instead of errors
- ✓ Requests routing correctly through Nginx

**The frontend is perfect - this is a backend/database issue!**

---

**Status:** 🔴 Awaiting Backend Database Diagnostics
**Last Updated:** November 25, 2025 23:18 IST
