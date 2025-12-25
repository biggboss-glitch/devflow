# Database Migration Fix - Password Authentication Error

## 🔍 Problem Identified

You have **TWO PostgreSQL instances** running on port 5432:
1. **Docker container** (`devflow-postgres`) - password: `postgres`
2. **Local PostgreSQL service** - different password

When Node.js connects to `localhost:5432`, it connects to the **local PostgreSQL** (not Docker), causing password authentication failures.

## ✅ Solution Options

### Option 1: Stop Local PostgreSQL Service (Recommended)

**Step 1:** Stop the local PostgreSQL service

```powershell
# Find PostgreSQL service
Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}

# Stop the service (replace SERVICE_NAME with actual name)
Stop-Service -Name "postgresql-x64-14"  # Adjust name as needed

# Or use Services GUI: services.msc
```

**Step 2:** Verify Docker container is accessible

```powershell
docker ps | findstr devflow-postgres
```

**Step 3:** Run migrations

```powershell
cd backend
npm run migrate
```

### Option 2: Change Docker Container Port

**Step 1:** Update `docker-compose.yml`

```yaml
postgres:
  ports:
    - "5433:5432"  # Changed from 5432:5432
```

**Step 2:** Update `backend/.env`

```env
DB_PORT=5433  # Changed from 5432
```

**Step 3:** Restart Docker container

```powershell
docker-compose down
docker-compose up -d postgres
```

**Step 4:** Run migrations

```powershell
cd backend
npm run migrate
```

### Option 3: Use Docker Container IP (Temporary)

**Step 1:** Get container IP

```powershell
docker inspect devflow-postgres | findstr IPAddress
```

**Step 2:** Update `backend/.env` temporarily

```env
DB_HOST=172.17.0.2  # Use actual container IP
```

**Step 3:** Run migrations

```powershell
cd backend
npm run migrate
```

**Step 4:** Revert to localhost after stopping local PostgreSQL

## 🎯 Recommended Solution: Option 1

**Why?** 
- Cleanest solution
- No port conflicts
- Standard development setup
- Docker container is isolated

**Steps:**

1. **Stop local PostgreSQL:**
   ```powershell
   # Check what's running
   Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
   
   # Stop it (adjust service name)
   Stop-Service -Name "postgresql-x64-14"
   ```

2. **Verify Docker container:**
   ```powershell
   docker ps | findstr devflow-postgres
   ```

3. **Test connection:**
   ```powershell
   docker exec devflow-postgres psql -U postgres -d devflow -c "SELECT 1;"
   ```

4. **Run migrations:**
   ```powershell
   cd backend
   npm run migrate
   ```

## 🔧 Quick Fix Commands

```powershell
# 1. Stop local PostgreSQL (adjust service name)
Stop-Service -Name "postgresql-x64-14"

# 2. Verify Docker is running
docker ps | findstr devflow-postgres

# 3. Test connection
docker exec devflow-postgres psql -U postgres -d devflow -c "SELECT version();"

# 4. Run migrations
cd backend
npm run migrate
```

## ✅ Verification

After fixing, verify:

```powershell
# Should connect successfully
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ host: 'localhost', port: 5432, database: 'devflow', user: 'postgres', password: 'postgres' }); pool.query('SELECT NOW()').then(r => { console.log('✓ Success:', r.rows[0]); pool.end(); }).catch(e => { console.error('✗ Failed:', e.message); pool.end(); });"
```

## 📝 Current Configuration

Your `.env` file should have:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devflow
DB_USER=postgres
DB_PASSWORD=postgres
```

This matches `docker-compose.yml`:
```yaml
POSTGRES_PASSWORD: postgres
```

## 🚨 If You Need Local PostgreSQL

If you need both:
1. Change Docker port to `5433:5432` in `docker-compose.yml`
2. Update `.env` to use `DB_PORT=5433`
3. Restart Docker: `docker-compose restart postgres`

---

**After fixing, your migrations should run successfully!** ✅

