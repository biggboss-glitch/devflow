# Free Hosting & Deployment Guide for DevFlow

Complete guide to hosting DevFlow for free and deploying to production.

## 📚 Table of Contents

1. [Free Hosting Options](#free-hosting-options)
2. [GitHub Setup](#github-setup)
3. [Deployment Methods](#deployment-methods)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Domain Setup](#domain-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## 🆓 Free Hosting Options

### 1. **Render** (Recommended - Easiest)
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ PostgreSQL database included
- ✅ SSL certificates included
- ✅ Easy setup

**Limits:**
- Services sleep after 15 minutes of inactivity (free tier)
- 750 hours/month free

### 2. **Railway**
- ✅ Free tier with $5 credit/month
- ✅ PostgreSQL included
- ✅ Auto-deploy from GitHub
- ✅ Simple setup

**Limits:**
- $5 credit per month
- Pay-as-you-go after credit

### 3. **Fly.io**
- ✅ Generous free tier
- ✅ PostgreSQL included
- ✅ Global deployment
- ✅ Great for Docker

**Limits:**
- 3 shared-cpu VMs
- 3GB persistent volumes

### 4. **Heroku** (Limited Free Tier)
- ⚠️ No longer offers free tier
- ✅ Easy deployment
- ✅ Add-ons available

### 5. **Vercel** (Frontend Only)
- ✅ Free tier
- ✅ Automatic deployments
- ✅ Great for static sites
- ⚠️ Backend needs separate hosting

### 6. **Netlify** (Frontend Only)
- ✅ Free tier
- ✅ Easy setup
- ✅ Automatic deployments
- ⚠️ Backend needs separate hosting

---

## 🔧 GitHub Setup

### Initial Repository Setup

```bash
# 1. Navigate to your project
cd fullstackapp

# 2. Check current remote
git remote -v

# 3. If no remote, add GitHub remote
git remote add origin https://github.com/yourusername/devflow.git

# 4. Verify remote
git remote -v
```

### Pushing Code to GitHub

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit changes
git commit -m "Initial commit: DevFlow project"

# 4. Push to GitHub
git push -u origin main

# For subsequent pushes
git add .
git commit -m "Your commit message"
git push origin main
```

### Setting Up GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          echo "Deployment triggered"
          # Add deployment commands here
```

---

## 🚀 Deployment Methods

### Method 1: Render (Recommended)

#### Step 1: Prepare Your Repository

```bash
# Ensure all code is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub account

#### Step 3: Deploy PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `devflow-db`
3. Region: Choose closest to you
4. Database: `devflow`
5. User: `devflow_user`
6. Click "Create Database"
7. **Save connection string** (you'll need this)

#### Step 4: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `devflow-backend`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Docker Context:** `backend`
   - **Build Command:** (leave empty, Docker handles it)
   - **Start Command:** (leave empty, Docker handles it)

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=<from-postgres-connection-string>
   DB_PORT=5432
   DB_NAME=devflow
   DB_USER=devflow_user
   DB_PASSWORD=<from-postgres-connection-string>
   JWT_SECRET=<generate-random-string>
   JWT_REFRESH_SECRET=<generate-random-string>
   ```

5. Click "Create Web Service"

#### Step 5: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `devflow-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://devflow-backend.onrender.com/api
     ```

4. Click "Create Static Site"

#### Step 6: Update Frontend API URL

After backend is deployed, update frontend environment:

1. Go to Frontend service settings
2. Update `VITE_API_URL` to your backend URL
3. Redeploy frontend

---

### Method 2: Railway

#### Step 1: Setup

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"

#### Step 2: Deploy Database

1. Click "New" → "Database" → "PostgreSQL"
2. Railway automatically creates database
3. Note the connection details

#### Step 3: Deploy Backend

1. Add service → "GitHub Repo"
2. Select your repository
3. Railway detects Dockerfile automatically
4. Set root directory to `backend`
5. Add environment variables (same as Render)
6. Deploy

#### Step 4: Deploy Frontend

1. Add another service
2. Select same repository
3. Set root directory to `frontend`
4. Build command: `npm install && npm run build`
5. Start command: `npm run preview` (or use static hosting)
6. Add environment variables
7. Deploy

---

### Method 3: Fly.io

#### Step 1: Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

#### Step 2: Login

```bash
fly auth login
```

#### Step 3: Initialize App

```bash
# For backend
cd backend
fly launch

# For frontend
cd frontend
fly launch
```

#### Step 4: Deploy

```bash
fly deploy
```

---

### Method 4: Vercel (Frontend) + Render (Backend)

#### Frontend on Vercel

1. Go to https://vercel.com
2. Import GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://your-backend-url.com/api
     ```

4. Deploy

#### Backend on Render

Follow Render backend deployment steps above.

---

## 📝 Step-by-Step Deployment (Render - Complete)

### Prerequisites

```bash
# 1. Ensure code is on GitHub
git status
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Verify Docker files exist
ls backend/Dockerfile
ls frontend/Dockerfile
```

### Database Setup

1. **Create PostgreSQL on Render:**
   - Name: `devflow-db`
   - Database: `devflow`
   - Save connection string

2. **Get Connection Details:**
   ```
   Host: <from-render>
   Port: 5432
   Database: devflow
   User: <from-render>
   Password: <from-render>
   ```

### Backend Deployment

1. **Create Web Service:**
   - Source: GitHub repository
   - Type: Docker
   - Dockerfile: `backend/Dockerfile`
   - Docker Context: `backend`

2. **Environment Variables:**
   ```bash
   NODE_ENV=production
   PORT=5000
   DB_HOST=<postgres-host>
   DB_PORT=5432
   DB_NAME=devflow
   DB_USER=<postgres-user>
   DB_PASSWORD=<postgres-password>
   JWT_SECRET=<generate-strong-secret>
   JWT_REFRESH_SECRET=<generate-strong-secret>
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   ```

3. **Generate Secrets:**
   ```bash
   # Generate JWT secrets (use any method)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy and Note URL:**
   - Wait for deployment
   - Note the backend URL: `https://devflow-backend.onrender.com`

### Frontend Deployment

1. **Create Static Site:**
   - Source: GitHub repository
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

2. **Environment Variables:**
   ```bash
   VITE_API_URL=https://devflow-backend.onrender.com/api
   ```

3. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment
   - Note the frontend URL

### Verify Deployment

1. **Test Backend:**
   ```bash
   curl https://devflow-backend.onrender.com/health
   ```

2. **Test Frontend:**
   - Open frontend URL in browser
   - Should see login page

3. **Test API:**
   - Visit: `https://devflow-backend.onrender.com/api-docs`
   - Should see Swagger documentation

---

## 🔐 Environment Configuration

### Backend Environment Variables

Create `backend/.env.production`:

```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=devflow
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS (update with your frontend URL)
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Frontend Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Update Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: devflow
      POSTGRES_USER: devflow_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devflow_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: devflow
      DB_USER: devflow_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "5000:5000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: http://localhost:5000/api
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 🌐 Domain Setup

### Using Custom Domain (Render)

1. **In Render Dashboard:**
   - Go to your service
   - Click "Settings"
   - Scroll to "Custom Domains"
   - Add your domain

2. **Update DNS:**
   - Add CNAME record pointing to Render URL
   - Wait for DNS propagation

3. **SSL Certificate:**
   - Render automatically provisions SSL
   - Wait for certificate activation

### Using Custom Domain (Vercel)

1. **In Vercel Dashboard:**
   - Go to project settings
   - Click "Domains"
   - Add your domain

2. **Update DNS:**
   - Add CNAME or A record as instructed
   - Wait for verification

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://your-backend-url.com/health

# Database connection
# Check Render/Railway dashboard
```

### Logs

**Render:**
- View logs in dashboard
- Real-time log streaming

**Railway:**
- View logs in dashboard
- Download logs

**Fly.io:**
```bash
fly logs
```

### Updates

```bash
# 1. Make changes locally
git add .
git commit -m "Update: new features"
git push origin main

# 2. Platform auto-deploys (if connected to GitHub)
# Or manually trigger deployment
```

### Database Backups

**Render:**
- Automatic daily backups
- Manual backup option in dashboard

**Railway:**
- Manual backup via dashboard
- Export database:
  ```bash
  pg_dump -h <host> -U <user> -d devflow > backup.sql
  ```

---

## 🐛 Troubleshooting

### Deployment Issues

**Problem: Build fails**
```bash
# Check logs in platform dashboard
# Verify Dockerfile is correct
# Check environment variables
```

**Problem: Database connection fails**
```bash
# Verify connection string
# Check database is running
# Verify credentials
# Check firewall/network settings
```

**Problem: Frontend can't connect to backend**
```bash
# Verify VITE_API_URL is correct
# Check CORS settings in backend
# Verify backend is accessible
```

### Common Errors

**Error: "Port already in use"**
- Platform handles port assignment automatically
- Check if service is already running

**Error: "Database connection timeout"**
- Verify database credentials
- Check database is accessible
- Verify network settings

**Error: "Build timeout"**
- Optimize Dockerfile
- Reduce build steps
- Use build cache

---

## 🔄 Continuous Deployment

### Automatic Deployments

Most platforms support automatic deployment:

1. **Connect GitHub repository**
2. **Enable auto-deploy**
3. **Push to main branch**
4. **Platform automatically deploys**

### Manual Deployment

```bash
# 1. Push code
git push origin main

# 2. Trigger deployment in platform dashboard
# Or use CLI (platform-specific)
```

---

## 📝 Deployment Checklist

Before deploying:

- [ ] All code committed to GitHub
- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] Docker files tested locally
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] CORS configured correctly
- [ ] SSL certificates active
- [ ] Domain configured (if using)
- [ ] Monitoring set up

---

## 🎯 Quick Reference

### Push Code to GitHub

```bash
git add .
git commit -m "Your message"
git push origin main
```

### Deploy to Render

1. Connect GitHub repo
2. Create PostgreSQL database
3. Deploy backend (Docker)
4. Deploy frontend (Static Site)
5. Configure environment variables

### Update Deployment

```bash
git push origin main
# Platform auto-deploys
```

---

## 📚 Additional Resources

- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app
- **Fly.io Docs:** https://fly.io/docs
- **Vercel Docs:** https://vercel.com/docs
- **Docker Docs:** https://docs.docker.com

---

## 🆘 Getting Help

- Check platform documentation
- Review deployment logs
- Test locally first
- Verify environment variables
- Check network connectivity

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
**Project:** DevFlow
**Repository:** https://github.com/yourusername/devflow

