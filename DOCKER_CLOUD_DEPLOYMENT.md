# 🚀 Docker Cloud Deployment Guide - DevFlow

## Overview

This guide covers deploying the DevFlow application to the cloud using Docker containers with Prometheus and Grafana monitoring.

---

## 📋 Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 1.29+)
- Docker Hub account (for pushing images)
- Cloud provider account (AWS, Azure, DigitalOcean, GCP)
- Git installed

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           Cloud Provider (AWS/Azure/etc)        │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────────────────────────────────┐   │
│  │        Docker Host / Kubernetes         │   │
│  │                                           │   │
│  │  ┌──────────────────────────────────┐   │   │
│  │  │    Docker Network (bridge)       │   │   │
│  │  │                                   │   │   │
│  │  │  ┌────────┐  ┌────────┐  ┌──────┐   │   │
│  │  │  │ Postgres│  │Backend │  │Frontend   │   │
│  │  │  │ Port   │  │ Port   │  │Port   │   │   │
│  │  │  │ 5432   │  │ 5000   │  │ 80    │   │   │
│  │  │  └────────┘  └────────┘  └──────┘   │   │
│  │  │                                       │   │
│  │  │  ┌──────────────┐  ┌─────────────┐   │   │
│  │  │  │ Prometheus   │  │  Grafana    │   │   │
│  │  │  │ Port 9090    │  │  Port 3000  │   │   │
│  │  │  └──────────────┘  └─────────────┘   │   │
│  │  │                                       │   │
│  │  └───────────────────────────────────────┘   │
│  │                                               │
│  └───────────────────────────────────────────────┘
│                    ↓                              │
│  ┌──────────────────────────────────────────┐   │
│  │  Load Balancer / Reverse Proxy (Nginx)  │   │
│  │         Routes to containers             │   │
│  └──────────────────────────────────────────┘   │
│                                                   │
└─────────────────────────────────────────────────┘
                      ↑
                  Public Access
```

---

## 🐳 Local Testing Before Cloud Deployment

### 1. Prepare Environment Files

```bash
# Copy example to development env
cp .env.example .env.development

# Copy example to production env (fill with actual secrets)
cp .env.example .env.production
```

Edit `.env.production` with:
```env
POSTGRES_PASSWORD=generate-strong-password-here
JWT_SECRET=generate-32-char-secret-here
JWT_REFRESH_SECRET=generate-32-char-secret-here
FRONTEND_URL=https://your-domain.com
VITE_API_URL=https://your-domain.com/api
```

### 2. Build Locally

```bash
# Build all images
docker-compose build

# Or build specific service
docker-compose build backend
docker-compose build frontend
```

### 3. Run Locally (Development)

```bash
# Start with development compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Test Services

```bash
# Test Backend API
curl http://localhost:5000/api/health

# Test Frontend
curl http://localhost:3000

# Test Prometheus
curl http://localhost:9090

# Test Grafana
curl http://localhost:3001
```

### 5. Stop Services

```bash
docker-compose down

# Clean up volumes (warning: deletes data)
docker-compose down -v
```

---

## 🐋 Push Images to Docker Hub

### 1. Login to Docker Hub

```bash
docker login -u your-dockerhub-username
```

### 2. Tag Images

```bash
# Backend
docker tag devflow-backend:latest your-dockerhub-username/devflow-backend:latest
docker tag devflow-backend:latest your-dockerhub-username/devflow-backend:v1.0.0

# Frontend
docker tag devflow-frontend:latest your-dockerhub-username/devflow-frontend:latest
docker tag devflow-frontend:latest your-dockerhub-username/devflow-frontend:v1.0.0
```

### 3. Push Images

```bash
# Backend
docker push your-dockerhub-username/devflow-backend:latest
docker push your-dockerhub-username/devflow-backend:v1.0.0

# Frontend
docker push your-dockerhub-username/devflow-frontend:latest
docker push your-dockerhub-username/devflow-frontend:v1.0.0
```

### 4. Verify on Docker Hub

Visit: `https://hub.docker.com/r/your-dockerhub-username/devflow-backend`

---

## ☁️ Cloud Deployment Options

### Option 1: AWS EC2 + Docker

#### Step 1: Launch EC2 Instance

```bash
# Choose Ubuntu 22.04 LTS
# Instance type: t3.medium (1 vCPU, 1GB RAM) minimum
# Security Group: Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3001 (Grafana)
```

#### Step 2: Install Docker

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

#### Step 3: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/your-username/devflow.git
cd devflow
```

#### Step 4: Deploy with Production Compose

```bash
# Load environment variables
export $(cat .env.production | xargs)

# Start services with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

#### Step 5: Configure Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo tee /etc/nginx/sites-available/devflow > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /grafana/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/devflow /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

### Option 2: DigitalOcean App Platform

#### Step 1: Create App on DigitalOcean

1. Go to DigitalOcean Console
2. Click "Create" → "Apps"
3. Connect GitHub repository
4. Configure services

#### Step 2: Configure app.yml

```yaml
name: devflow
services:
- name: postgres
  github:
    repo: your-username/devflow
    branch: main
  build_command: npm install
  run_command: npm run migrate && npm start
  envs:
  - key: POSTGRES_DB
    value: devflow
  - key: POSTGRES_PASSWORD
    value: ${DB_PASSWORD}

- name: backend
  github:
    repo: your-username/devflow
    branch: main
  build_command: npm install && npm run build
  run_command: npm start
  http_port: 5000
  envs:
  - key: NODE_ENV
    value: production
  - key: DB_HOST
    value: ${postgres.HOSTNAME}

- name: frontend
  github:
    repo: your-username/devflow
    branch: main
  build_command: npm install && npm run build
  run_command: npm start
  http_port: 3000

databases:
- name: postgres
  engine: PG
  version: "14"
```

---

### Option 3: Azure Container Instances

```bash
# Create resource group
az group create --name devflow-rg --location eastus

# Create container registry
az acr create --resource-group devflow-rg --name devflowregistry --sku Basic

# Login to registry
az acr login --name devflowregistry

# Tag images
docker tag devflow-backend:latest devflowregistry.azurecr.io/devflow-backend:latest
docker tag devflow-frontend:latest devflowregistry.azurecr.io/devflow-frontend:latest

# Push to Azure
docker push devflowregistry.azurecr.io/devflow-backend:latest
docker push devflowregistry.azurecr.io/devflow-frontend:latest

# Deploy containers
az container create \
  --resource-group devflow-rg \
  --name devflow-app \
  --image devflowregistry.azurecr.io/devflow-backend:latest \
  --registry-login-server devflowregistry.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --ports 5000 \
  --environment-variables NODE_ENV=production
```

---

## 📊 Accessing Monitoring

### Prometheus (Metrics)
```
http://your-domain.com:9090
```

### Grafana (Dashboards)
```
http://your-domain.com:3001

Default Credentials:
Username: admin
Password: admin (change after login)
```

---

## 🛠️ Maintenance Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check status
docker-compose ps

# View resource usage
docker stats

# Backup database
docker-compose exec postgres pg_dump -U postgres devflow > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres devflow

# Update images
docker-compose pull
docker-compose up -d

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Clean up unused resources
docker system prune -a
```

---

## 📈 Scaling

### Increase Resource Limits

Edit `docker-compose.prod.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '4'          # Increase CPU
          memory: 4096M      # Increase Memory
```

### Database Optimization

```sql
-- Connect to database
docker-compose exec postgres psql -U postgres -d devflow

-- Create indexes
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);

-- Analyze performance
ANALYZE;
```

---

## 🔐 Security Best Practices

✅ **Done:**
- [x] Non-root containers
- [x] Health checks enabled
- [x] Secrets in environment variables
- [x] Resource limits configured

❓ **To Implement:**
- [ ] Enable HTTPS/TLS
- [ ] Setup firewall rules
- [ ] Enable database encryption
- [ ] Implement API rate limiting
- [ ] Setup log aggregation (ELK Stack)
- [ ] Regular security scanning
- [ ] Implement automated backups

---

## 🐛 Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs service-name

# Restart service
docker-compose restart service-name

# Rebuild image
docker-compose build --no-cache service-name
```

### Database connection errors
```bash
# Check database connectivity
docker-compose exec backend ping postgres

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### High memory usage
```bash
# Check usage
docker stats

# Reduce limits in docker-compose.yml
# Restart services
docker-compose restart
```

---

## 📞 Support

For issues and troubleshooting:
1. Check application logs: `docker-compose logs`
2. Review monitoring dashboards in Grafana
3. Check Prometheus metrics: `http://localhost:9090`
4. Verify Docker configuration: `docker-compose config`

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prometheus Documentation](https://prometheus.io/docs)
- [Grafana Documentation](https://grafana.com/docs)
