# 🚀 Docker Quick Start Guide

## 5-Minute Setup

### Development Environment

```bash
# 1. Prepare environment
cp .env.example .env.development

# 2. Build and start services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 3. Wait for services to be healthy (30 seconds)
docker-compose ps

# 4. Access services
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
```

### Production Deployment (AWS EC2)

```bash
# 1. Prepare production environment
cp .env.example .env.production
# Edit .env.production with actual secrets

# 2. SSH to EC2 instance
ssh -i key.pem ubuntu@your-ec2-ip

# 3. Install Docker (one-liner)
curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker ubuntu

# 4. Clone repository
git clone https://github.com/biggboss-glitch/devflow.git && cd devflow

# 5. Start with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 6. View logs
docker-compose logs -f
```

---

## 🐳 Docker Commands Reference

### Build & Run

```bash
# Build all images
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View running services
docker-compose ps

# View logs
docker-compose logs -f [service-name]
```

### Service Management

```bash
# Restart service
docker-compose restart backend

# Rebuild specific service
docker-compose build backend

# View service logs (last 100 lines)
docker-compose logs --tail=100 backend

# Execute command in container
docker-compose exec backend npm run migrate

# Check resource usage
docker stats
```

### Database Operations

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d devflow

# Backup database
docker-compose exec postgres pg_dump -U postgres devflow > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres devflow

# Run migrations
docker-compose exec backend npm run migrate

# Seed data
docker-compose exec backend npm run seed
```

### Docker Hub Operations

```bash
# Login
docker login -u username

# Tag image
docker tag devflow-backend:latest username/devflow-backend:v1.0.0

# Push to Docker Hub
docker push username/devflow-backend:v1.0.0

# Pull image
docker pull username/devflow-backend:v1.0.0
```

---

## 📊 Monitoring & Logs

### Access Monitoring Dashboards

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | `http://localhost:3000` | - |
| Backend API | `http://localhost:5000/api` | - |
| Prometheus | `http://localhost:9090` | - |
| Grafana | `http://localhost:3001` | admin/admin |

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 50 lines
docker-compose logs --tail=50 backend

# Follow errors
docker-compose logs -f | grep ERROR
```

---

## 🔧 Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check status
docker-compose ps

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose build --no-cache && docker-compose up -d
```

### Database Connection Issues

```bash
# Check if postgres is healthy
docker-compose exec postgres pg_isready -U postgres

# Check postgres logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### High Memory Usage

```bash
# View resource usage
docker stats

# Check limits in docker-compose.yml
cat docker-compose.yml | grep -A5 "deploy:"

# Reduce container memory and restart
# Edit docker-compose.yml, then:
docker-compose restart
```

### Port Already in Use

```bash
# Check what's using port
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :5433  # Database

# Kill process
kill -9 PID

# Or use different port
PORT=5001 docker-compose up
```

---

## 🔐 Security

### Change Default Passwords

```bash
# Edit .env file before starting
POSTGRES_PASSWORD=your-strong-password
JWT_SECRET=your-32-char-secret
JWT_REFRESH_SECRET=your-32-char-secret

# Change Grafana admin password after login
# Admin → Preferences → Change Password
```

### View Environment Variables

```bash
# Check what's loaded
docker-compose config | grep environment

# Check in running container
docker-compose exec backend env | grep JWT
```

---

## 📈 Performance Optimization

### Reduce Image Size

```bash
# Check image sizes
docker images

# Prune unused images
docker image prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Improve Build Speed

```bash
# Use BuildKit (faster builds)
DOCKER_BUILDKIT=1 docker-compose build

# Build in parallel
docker-compose build --parallel
```

### Optimize Runtime Performance

```bash
# Set resource limits in docker-compose.prod.yml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

---

## 🚀 Deployment Checklist

Before deploying to cloud:

- [ ] Environment variables configured (.env.production)
- [ ] Database password changed from default
- [ ] JWT secrets are strong (32+ characters)
- [ ] Images built and tested locally
- [ ] Images pushed to Docker Hub
- [ ] Cloud infrastructure ready (VM, security groups, etc.)
- [ ] Domain configured and DNS updated
- [ ] SSL certificate ready
- [ ] Monitoring dashboards accessible
- [ ] Database backups configured

---

## 📚 Additional Resources

- **Full Deployment Guide**: [DOCKER_CLOUD_DEPLOYMENT.md](DOCKER_CLOUD_DEPLOYMENT.md)
- **Docker Documentation**: https://docs.docker.com
- **Docker Compose Docs**: https://docs.docker.com/compose
- **Prometheus Docs**: https://prometheus.io/docs
- **Grafana Docs**: https://grafana.com/docs

---

## 💡 Tips & Tricks

### Watch Services During Startup

```bash
watch -n 1 'docker-compose ps'
```

### Follow Multiple Service Logs

```bash
docker-compose logs -f backend frontend postgres
```

### Copy Files To/From Container

```bash
# From container
docker-compose cp postgres:/var/lib/postgresql/data ./backup

# To container
docker-compose cp backup.sql postgres:/tmp/
```

### Export Configuration

```bash
# See final compose configuration
docker-compose config > config-resolved.yml
```

### Debug Container

```bash
# Open shell in container
docker-compose exec backend sh

# Install debugging tools
apk add curl wget nslookup
```

---

Need help? Check logs with: `docker-compose logs -f`
