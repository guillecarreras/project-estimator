# Quick Start - Production Deployment

## 60-Minute Setup Guide

### Prerequisites Check (5 min)
```bash
node --version           # Should be 18+
docker --version         # Docker must be installed
docker-compose --version # Docker Compose v2+
git --version           # Git for version control
```

### Step 1: Clone & Setup Environment (10 min)
```bash
# Clone repository
git clone <your-repo> project-estimator
cd project-estimator

# Copy environment template
cp .env.example .env

# Edit .env with production values
nano .env
# Set:
# NODE_ENV=production
# DB_PASSWORD=<strong-password>
# JWT_SECRET=<32-char-secret>
# API_KEY=<unique-api-key>
# REDIS_PASSWORD=<strong-password>
```

### Step 2: Generate SSL Certificates (5 min)
```bash
mkdir -p ssl

# Option A: Self-signed (development)
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/CN=localhost"

# Option B: Let's Encrypt (production recommended)
# Use certbot: sudo apt install certbot
# sudo certbot certonly --standalone -d yourdomain.com
# Then copy to ssl/ directory
```

### Step 3: Build & Start Application (15 min)
```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# Verify containers are healthy (wait 10 seconds)
sleep 10
docker-compose -f docker-compose.prod.yml ps
```

### Step 4: Verify Deployment (10 min)
```bash
# Check health
curl http://localhost/health | jq .

# Check readiness
curl http://localhost/ready | jq .

# Check API is responding
curl http://localhost/api/status

# View logs
docker-compose -f docker-compose.prod.yml logs app
```

### Step 5: Setup Automated Backups (5 min)
```bash
# Make backup script executable
chmod +x scripts/backup-db.sh

# Add to crontab
crontab -e
# Add line: 0 2 * * * cd /path/to/project && bash scripts/backup-db.sh
```

### Step 6: GitHub Secrets Setup (10 min)
```bash
# Generate SSH key for deployment
ssh-keygen -t rsa -b 4096 -f deploy_key -N ""

# Add public key to deployment server
ssh-copy-id -i deploy_key.pub deploy@your-server

# Add secrets to GitHub:
# DEPLOY_KEY = content of deploy_key
# DEPLOY_USER = deploy
# DEPLOY_HOST_PROD = your-server.com
# DEPLOY_PATH_PROD = /path/to/project
# SLACK_WEBHOOK = your-webhook-url (optional)
```

## Production Architecture

```
GitHub
  ↓ (Push to main)
┌─────────────────────┐
│  GitHub Actions     │
│  - Test & Build     │
│  - Security Scan    │
│  - Push to Registry │
└─────────────────────┘
  ↓ (Trigger deployment)
┌─────────────────────┐
│  Production Server  │
│  ┌───────────────┐  │
│  │ Nginx:80/443 │  │
│  ├───────────────┤  │
│  │ Node.js App   │  │
│  ├───────────────┤  │
│  │ PostgreSQL    │  │
│  ├───────────────┤  │
│  │ Redis Cache   │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Daily Operations

### Monitoring
```bash
# Health check
curl http://your-domain/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check metrics
curl http://your-domain/metrics | head -50
```

### Backup & Restore
```bash
# Manual backup
bash scripts/backup-db.sh

# List backups
ls -lh backups/

# Restore from backup
bash scripts/restore-db.sh backups/backup_20240101_120000.sql.gz
```

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
curl http://your-domain/health
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Verify .env is set correctly
cat .env | grep -E "DB_|REDIS_|JWT_"

# Check ports are available
lsof -i :80
lsof -i :443
```

### Database connection error
```bash
# Check database is running
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "SELECT 1;"
```

### High memory usage
```bash
# Check container stats
docker stats

# Check Node.js heap
curl http://localhost/health | jq '.checks.memory'

# Restart container
docker-compose -f docker-compose.prod.yml restart app
```

## Security Checklist

- [ ] SSL certificates installed
- [ ] .env file has strong passwords
- [ ] JWT_SECRET is 32+ characters
- [ ] Database backup working
- [ ] SSH key secured
- [ ] GitHub secrets configured
- [ ] Firewall rules in place
- [ ] Rate limiting enabled
- [ ] Monitoring configured
- [ ] Log retention set to 30 days

## Performance Checklist

- [ ] Docker images built (multi-stage)
- [ ] Nginx compression enabled
- [ ] Database indexes created
- [ ] Redis connection pooling
- [ ] Health checks responding
- [ ] Metrics collecting
- [ ] Logs rotating daily
- [ ] Backups automated

## Additional Commands

```bash
# Use Makefile for common tasks
make help              # Show all commands
make healthcheck       # Verify health
make docker-logs       # View logs
make backup            # Backup database
make restore FILE=...  # Restore backup
```

## Emergency Procedures

### Rollback to Previous Version
```bash
# Get previous image tag
docker images | grep project-estimator

# Stop current
docker-compose -f docker-compose.prod.yml down

# Start previous version
docker-compose -f docker-compose.prod.yml up -d --build
```

### Emergency Database Restore
```bash
# Restore from most recent backup
LATEST=$(ls -t backups/ | head -1)
bash scripts/restore-db.sh backups/$LATEST
```

## Next Steps

1. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
2. Setup monitoring with Sentry or similar
3. Configure automated alerts
4. Document any customizations
5. Schedule regular security audits
6. Plan capacity expansion

---

**Setup Time**: ~60 minutes
**Maintenance**: ~1 hour/month
**Support**: See DEPLOYMENT.md troubleshooting section
**Status**: Production Ready ✅
