# 🚀 Start DevFlow Services - Quick Guide

## Prerequisites Check

Before starting, ensure:
- ✅ PostgreSQL is running (Docker container)
- ✅ Backend `.env` file exists with correct configuration
- ✅ Frontend `.env` file exists (optional, has defaults)

## 📋 Start Commands

### Option 1: Start Both Services (Recommended)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Option 2: Start in Background (PowerShell)

**Backend:**
```powershell
cd backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

**Frontend:**
```powershell
cd frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

## ✅ Verification

After starting, verify:

1. **Backend Health Check:**
   ```powershell
   curl http://localhost:5000/health
   ```
   Expected: `{"status":"ok","message":"DevFlow API is running","database":"connected"}`

2. **Frontend:**
   - Open browser: http://localhost:5173
   - Should see DevFlow login page

3. **API Documentation:**
   - Open: http://localhost:5000/api-docs
   - Should see Swagger UI

## 🔧 Troubleshooting

### Backend won't start:
- Check database is running: `docker ps | findstr devflow-postgres`
- Verify `.env` file exists and has correct DB_PASSWORD
- Check port 5000 is not in use: `netstat -ano | findstr :5000`

### Frontend won't start:
- Check port 5173 is not in use
- Verify `node_modules` installed: `npm install`
- Check for TypeScript errors: `npm run build`

### Database connection errors:
- Verify PostgreSQL container: `docker ps`
- Check DB_PORT in `.env` matches Docker port (5433)
- Test connection: `docker exec devflow-postgres psql -U postgres -d devflow -c "SELECT 1;"`

## 📊 Expected Output

### Backend (Terminal 1):
```
[nodemon] starting `ts-node src/server.ts`
Server running on port 5000 in development mode
Database connection established
```

### Frontend (Terminal 2):
```
  VITE v5.0.10  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🎯 Quick Start Script

Save this as `start-dev.ps1`:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✓ Services starting in new windows..."
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:5173"
```

Run with: `.\start-dev.ps1`

---

**Ready to test!** 🚀







