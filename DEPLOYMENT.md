# DevFlow Deployment Guide

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for Quick Start)

This is the easiest way to get the entire stack running.

```bash
# Clone the repository
git clone <your-repo-url>
cd devflow

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### Option 2: Local Development

**Prerequisites:**
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

**Backend Setup:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm run dev
```

**Frontend Setup:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Option 3: Production Deployment

#### Backend Deployment (Railway/Render/Heroku)

**Railway:**
1. Create new project on Railway
2. Add PostgreSQL database
3. Connect GitHub repository
4. Set environment variables from .env.example
5. Deploy backend folder
6. Run migrations: `npm run migrate`

**Render:**
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add PostgreSQL database
6. Set environment variables
7. Run migrations manually or via deploy hook

**Environment Variables for Production:**
```env
NODE_ENV=production
PORT=5000
DB_HOST=<your-db-host>
DB_PORT=5432
DB_NAME=<your-db-name>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_REFRESH_EXPIRES_IN=30d
GITHUB_TOKEN=<your-github-token>
FRONTEND_URL=https://your-frontend-url.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

#### Frontend Deployment (Vercel/Netlify)

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_WS_URL=https://your-backend-url.com
VITE_ENV=production
```

**Netlify:**
1. Connect GitHub repository
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variables
5. Deploy

## 🔐 Security Checklist for Production

### Backend
- [ ] Change all default secrets in .env
- [ ] Use strong JWT secrets (32+ characters, random)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS with specific origins
- [ ] Set up rate limiting appropriately
- [ ] Enable Helmet security headers
- [ ] Use environment-specific database credentials
- [ ] Set NODE_ENV=production
- [ ] Disable debug logging
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Use connection pooling for database
- [ ] Implement API versioning
- [ ] Set up monitoring and alerts

### Frontend
- [ ] Use HTTPS
- [ ] Configure CSP headers
- [ ] Minify and bundle assets
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure cache headers
- [ ] Remove console.logs
- [ ] Implement error boundaries
- [ ] Set up analytics

### Database
- [ ] Use strong passwords
- [ ] Enable SSL connections
- [ ] Set up automated backups
- [ ] Configure connection limits
- [ ] Enable query logging (for debugging)
- [ ] Set up replication (for high availability)
- [ ] Regular security updates

## 📊 Monitoring & Logging

### Application Monitoring

**Recommended Tools:**
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking
- **New Relic**: Full-stack observability
- **Datadog**: Infrastructure and application monitoring

**Setup Sentry (Example):**
```bash
npm install @sentry/node @sentry/tracing

# In server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Log Management

**Winston is already configured!**

Logs are written to:
- `logs/error.log` - Error level logs
- `logs/combined.log` - All logs

**For production, consider:**
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Papertrail**
- **Loggly**
- **CloudWatch** (AWS)

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm ci
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm ci
      
      - name: Run frontend tests
        run: cd frontend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          # Add Railway deployment commands
          
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          cd frontend && vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 🗄️ Database Management

### Running Migrations

**Local:**
```bash
cd backend
npm run migrate
```

**Production:**
```bash
# SSH into server or use platform CLI
cd backend
NODE_ENV=production npm run migrate
```

### Backup Strategy

**Automated Backups:**
```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql
```

**Restore from Backup:**
```bash
psql -h $DB_HOST -U $DB_USER $DB_NAME < backup_file.sql
```

## 🧪 Testing in Production

### Health Checks

**Backend Health:**
```bash
curl https://your-api.com/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "DevFlow API is running",
  "database": "connected"
}
```

### Load Testing

**Using Apache Bench:**
```bash
ab -n 1000 -c 10 https://your-api.com/api/tasks
```

**Using Artillery:**
```bash
npm install -g artillery
artillery quick --count 10 --num 100 https://your-api.com/api/tasks
```

## 📈 Scaling Considerations

### Horizontal Scaling

**Backend:**
- Deploy multiple instances behind a load balancer
- Use sticky sessions for WebSocket connections
- Share session state via Redis

**Database:**
- Set up read replicas for read-heavy operations
- Use connection pooling
- Implement caching layer (Redis)

### Vertical Scaling

**Increase resources:**
- CPU: 2+ cores recommended
- RAM: 2GB+ for backend, 1GB+ for database
- Storage: SSD recommended

### Caching Strategy

**Implement Redis for:**
- Session storage
- API response caching
- Rate limiting
- Real-time data

```bash
# Add to docker-compose.yml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check database is running
docker-compose ps

# Check connection string
echo $DATABASE_URL

# Test connection
psql -h localhost -U postgres -d devflow
```

**Port Already in Use:**
```bash
# Find process using port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

**Migration Errors:**
```bash
# Check migration status
psql -h localhost -U postgres -d devflow -c "SELECT * FROM pg_tables WHERE schemaname='public';"

# Rollback and retry
# (Manual rollback - drop tables and re-run)
```

**WebSocket Connection Issues:**
- Check CORS configuration
- Verify WebSocket URL in frontend
- Check firewall rules
- Ensure Socket.IO versions match

## 📞 Support & Resources

- **Documentation**: See README.md and SETUP.md
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 🎉 Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] SSL/TLS certificates configured
- [ ] CORS configured with production URLs
- [ ] Rate limiting configured appropriately
- [ ] Logging configured and tested
- [ ] Monitoring and alerts set up
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**Happy Deploying! 🚀**
