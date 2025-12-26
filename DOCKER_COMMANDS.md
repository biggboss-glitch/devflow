# Docker Commands Reference Guide

Complete reference for all Docker commands used in DevFlow project management.

## 📦 Container Management

### View Container Status
```bash
# List all running containers
docker compose ps

# List all containers (including stopped)
docker compose ps -a

# View detailed container information
docker ps
docker ps -a
```

### Start Containers
```bash
# Start all services in detached mode (background)
docker compose up -d

# Start specific service
docker compose up -d backend
docker compose up -d frontend
docker compose up -d postgres

# Start and rebuild containers
docker compose up -d --build

# Start without cache (fresh build)
docker compose up -d --build --no-cache
```

### Stop Containers
```bash
# Stop all containers
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v

# Stop specific service
docker compose stop backend
docker compose stop frontend
```

### Restart Containers
```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

## 🔨 Building Images

### Build Commands
```bash
# Build all services
docker compose build

# Build specific service
docker compose build backend
docker compose build frontend

# Build without cache (fresh build)
docker compose build --no-cache

# Build specific service without cache
docker compose build --no-cache backend
```

### Rebuild and Restart
```bash
# Rebuild and restart all services
docker compose up -d --build

# Rebuild specific service and restart
docker compose up -d --build backend
docker compose up -d --build frontend
```

## 📋 Viewing Logs

### Container Logs
```bash
# View logs for all services
docker compose logs

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Follow logs (real-time)
docker compose logs -f

# Follow specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# View last N lines
docker compose logs --tail 50 backend
docker compose logs --tail 100 frontend

# View logs with timestamps
docker compose logs -t backend
```

### Filter Logs
```bash
# Search for errors in logs
docker compose logs backend | grep -i error
docker compose logs backend | grep -i "401\|unauthorized"

# View logs from specific time
docker compose logs --since 10m backend
docker compose logs --since 1h frontend
```

## 🗄️ Database Operations

### Database Access
```bash
# Access PostgreSQL shell
docker compose exec postgres psql -U postgres -d devflow

# Run SQL command directly
docker compose exec -T postgres psql -U postgres -d devflow -c "SELECT * FROM users;"

# List all tables
docker compose exec -T postgres psql -U postgres -d devflow -c "\dt"

# Check database version
docker compose exec -T postgres psql -U postgres -d devflow -c "SELECT version();"

# Count records in tables
docker compose exec -T postgres psql -U postgres -d devflow -c "SELECT COUNT(*) FROM tasks; SELECT COUNT(*) FROM teams; SELECT COUNT(*) FROM projects;"
```

### Database Backup
```bash
# Create backup
docker compose exec -T postgres pg_dump -U postgres devflow > backup.sql

# Restore from backup
docker compose exec -T postgres psql -U postgres -d devflow < backup.sql
```

## 🔍 Debugging & Inspection

### Container Inspection
```bash
# Inspect container details
docker inspect devflow-backend
docker inspect devflow-frontend

# View container resource usage
docker stats

# View specific container stats
docker stats devflow-backend
docker stats devflow-frontend
```

### Execute Commands in Containers
```bash
# Execute command in running container
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec postgres sh

# Run npm commands in backend
docker compose exec backend npm run build
docker compose exec backend npm test

# Check environment variables
docker compose exec backend env
docker compose exec backend env | grep JWT
docker compose exec backend env | grep DB
```

### Network Inspection
```bash
# List networks
docker network ls

# Inspect network
docker network inspect fullstackapp_default

# Test connectivity between containers
docker compose exec backend ping postgres
```

## 🧹 Cleanup Commands

### Remove Containers
```bash
# Stop and remove containers
docker compose down

# Remove containers and volumes
docker compose down -v

# Remove containers, volumes, and images
docker compose down -v --rmi all
```

### Clean Docker System
```bash
# Remove unused containers, networks, images
docker system prune

# Remove everything (including volumes)
docker system prune -a --volumes

# Remove specific image
docker rmi fullstackapp-backend
docker rmi fullstackapp-frontend
```

### Clean Build Cache
```bash
# Remove build cache
docker builder prune

# Remove all build cache
docker builder prune -a
```

## 🔄 Update & Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Or in one command
docker compose up -d --build --force-recreate
```

### Health Checks
```bash
# Check container health
docker compose ps

# Test backend health endpoint
curl http://localhost:5000/health

# Test frontend
curl http://localhost:3000

# Check database connection
docker compose exec postgres pg_isready -U postgres
```

## 🐛 Troubleshooting Commands

### Container Issues
```bash
# View container logs for errors
docker compose logs backend | grep -i error
docker compose logs frontend | grep -i error

# Check if container is running
docker compose ps

# Restart unhealthy container
docker compose restart backend

# Recreate container
docker compose up -d --force-recreate backend
```

### Port Conflicts
```bash
# Check what's using a port (Windows)
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :5433

# Kill process using port (Windows)
taskkill /PID <PID> /F
```

### Permission Issues
```bash
# Fix file permissions (Linux/Mac)
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo usermod -aG docker $USER
```

## 📊 Monitoring Commands

### Resource Usage
```bash
# Monitor all containers
docker stats

# Monitor specific container
docker stats devflow-backend --no-stream

# View container resource limits
docker inspect devflow-backend | grep -i memory
docker inspect devflow-backend | grep -i cpu
```

### Container Events
```bash
# View container events
docker events

# View events for specific container
docker events --filter container=devflow-backend
```

## 🔐 Security & Environment

### Environment Variables
```bash
# View environment variables in container
docker compose exec backend env

# Check specific env var
docker compose exec backend env | grep JWT_SECRET
docker compose exec backend env | grep DB_PASSWORD

# Set environment variable (temporary)
docker compose exec -e NEW_VAR=value backend sh
```

### Secrets Management
```bash
# View docker-compose config
docker compose config

# Validate docker-compose file
docker compose config --quiet
```

## 🚀 Production Commands

### Production Build
```bash
# Build for production
docker compose -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.prod.yml up -d

# View production logs
docker compose -f docker-compose.prod.yml logs -f
```

### Scaling Services
```bash
# Scale specific service
docker compose up -d --scale backend=3

# Scale with load balancer
docker compose up -d --scale backend=2 --scale frontend=2
```

## 📝 Common Workflows

### Complete Reset
```bash
# Stop everything
docker compose down -v

# Remove all images
docker rmi fullstackapp-backend fullstackapp-frontend

# Rebuild from scratch
docker compose build --no-cache

# Start fresh
docker compose up -d
```

### Quick Restart After Code Changes
```bash
# Rebuild and restart specific service
docker compose up -d --build backend

# Or rebuild all
docker compose up -d --build
```

### Debugging Workflow
```bash
# 1. Check container status
docker compose ps

# 2. View recent logs
docker compose logs --tail 50 backend

# 3. Check for errors
docker compose logs backend | grep -i error

# 4. Access container shell
docker compose exec backend sh

# 5. Test API endpoint
curl http://localhost:5000/health
```

### Development Workflow
```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# View development logs
docker compose -f docker-compose.dev.yml logs -f

# Rebuild after changes
docker compose -f docker-compose.dev.yml up -d --build
```

## 🎯 Quick Reference

### Most Used Commands
```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose up -d --build

# Stop everything
docker compose down

# Check status
docker compose ps

# View backend logs
docker compose logs -f backend

# Restart service
docker compose restart backend
```

### PowerShell Specific (Windows)
```powershell
# View logs with filtering
docker compose logs backend | Select-String -Pattern "error|Error|ERROR"

# Check container status
docker compose ps

# Test API endpoint
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

## 📚 Additional Resources

### Docker Compose Files
- `docker-compose.yml` - Main production configuration
- `docker-compose.dev.yml` - Development configuration
- `docker-compose.prod.yml` - Production configuration

### Dockerfiles
- `backend/Dockerfile` - Backend multi-stage build
- `frontend/Dockerfile` - Frontend build with Nginx

### Useful Aliases (Optional)
Add to your `.bashrc` or `.zshrc`:
```bash
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcl='docker compose logs -f'
alias dcb='docker compose build'
alias dcr='docker compose restart'
alias dcp='docker compose ps'
```

## ⚠️ Important Notes

1. **Always use `docker compose`** (not `docker-compose`) for newer Docker versions
2. **Use `-d` flag** to run containers in detached mode
3. **Use `--build` flag** when code changes are made
4. **Use `--no-cache`** for completely fresh builds
5. **Use `-v` with down** to remove volumes (clears database data)
6. **Check logs first** when troubleshooting issues
7. **Verify health** with `docker compose ps` and health endpoints

## 🔗 Related Documentation

- `DEPLOYMENT.md` - Full deployment guide
- `AUTHENTICATION_FIX_SUMMARY.md` - Auth fixes documentation
- `SYSTEM_TEST_REPORT.md` - System health report
- `QUICK_REFERENCE.md` - Quick start guide

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
**Docker Version:** Check with `docker --version`
**Docker Compose Version:** Check with `docker compose version`

