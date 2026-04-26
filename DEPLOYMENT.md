# Deployment Guide - Project Estimator

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Environment](#development-environment)
3. [Production Deployment](#production-deployment)
4. [Docker Setup](#docker-setup)
5. [Database Management](#database-management)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Git

### Local Development (5 minutes)

```bash
# 1. Clone and setup
git clone <repository>
cd project-estimator

# 2. Install dependencies
npm ci

# 3. Setup environment
cp .env.example .env
# Edit .env with your local settings

# 4. Build TypeScript
npm run build

# 5. Start development server
npm run dev
```

**Access application**: http://localhost:3000

## Development Environment

### Option 1: Local Services + Docker

```bash
# Start databases
docker-compose up -d postgres redis

# Install dependencies
npm ci

# Run development server
npm run dev
```

### Option 2: Full Docker Stack

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Available Endpoints

- **Health Check**: `GET /health`
- **Readiness**: `GET /ready`
- **Liveness**: `GET /live`
- **Metrics**: `GET /metrics`
- **Root**: `GET /`

## Production Deployment

### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Docker & Docker Compose installed
- SSL certificates (self-signed or Let's Encrypt)
- Reserved domain name
- Backup strategy in place

### 1. Prepare Server

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
sudo mkdir -p /app/project-estimator
sudo chown $USER:$USER /app/project-estimator
```

### 2. Deploy Application

```bash
# Clone repository
cd /app/project-estimator
git clone <repository> .

# Setup production environment
cp .env.example .env
# Edit .env with production values:
#   NODE_ENV=production
#   DB_PASSWORD=<secure-password>
#   JWT_SECRET=<secure-secret>
#   API_KEY=<secure-api-key>
#   REDIS_PASSWORD=<secure-password>

# Create SSL directory (if using self-signed)
mkdir -p ssl

# Generate SSL certificates (or use Let's Encrypt)
# For self-signed:
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# Build and start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Verify health
curl http://localhost/health
```

### 3. Setup Nginx Reverse Proxy

```bash
# Nginx is already configured in docker-compose.prod.yml
# Access through: http://localhost (port 80) or https://localhost (port 443)
```

### 4. Setup Database Backups

```bash
# Create backup directory
mkdir -p backups

# Setup daily backup cron job
# Add to crontab: crontab -e
0 2 * * * cd /app/project-estimator && bash scripts/backup-db.sh

# Or use systemd timer
sudo nano /etc/systemd/system/project-estimator-backup.service
```

### 5. Verification Checklist

```bash
# Check if containers are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Test health endpoints
curl http://localhost/health
curl http://localhost/ready
curl http://localhost/live

# Check database connection
docker-compose -f docker-compose.prod.yml exec -T app npm run db:status

# Check Redis connection
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

## Docker Setup

### Development Stack

```yaml
Services:
- app: Node.js application (port 3000)
- postgres: PostgreSQL database (port 5432)
- redis: Redis cache (port 6379)
```

### Production Stack

```yaml
Services:
- app: Node.js application (internal, port 3000)
- postgres: PostgreSQL database (internal, port 5432)
- redis: Redis cache (internal, port 6379)
- nginx: Reverse proxy (ports 80, 443)
```

### Common Docker Commands

```bash
# Development
docker-compose up -d                 # Start
docker-compose down                  # Stop
docker-compose logs -f               # View logs
docker-compose exec app bash         # Shell access

# Production
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml exec app bash
```

## Database Management

### Running Migrations

```bash
# Automatically on startup
docker-compose up -d  # Migrations run automatically

# Manual migration
npm run migrate

# View migration status
npm run migrate:status

# Rollback migrations
npm run migrate:down
```

### Backing Up Database

```bash
# Manual backup
bash scripts/backup-db.sh

# Automatic daily backup
# Configure in crontab or systemd timer

# Backup location: ./backups/
# Compression: automatic gzip
```

### Restoring from Backup

```bash
# List backups
ls -lh backups/

# Restore from backup
bash scripts/restore-db.sh backups/backup_project_estimator_20240101_120000.sql.gz

# Or manually
gunzip < backups/backup.sql.gz | psql -U postgres -d project_estimator
```

### Database Access

```bash
# Direct access
docker-compose exec postgres psql -U postgres -d project_estimator

# Useful commands:
\dt                    # List tables
\d table_name          # Describe table
SELECT COUNT(*) FROM table_name;  # Count records
```

## Monitoring & Logging

### Application Logs

```bash
# View real-time logs
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app

# Local log files
tail -f logs/$(date +%Y-%m-%d).log
```

### Metrics

```bash
# Prometheus metrics endpoint
curl http://localhost:9090/metrics

# Health metrics
curl http://localhost/health | jq .

# Custom metrics from app
curl http://localhost/metrics | grep -E "^(http_|db_|cache_)"
```

### Monitoring Endpoints

| Endpoint | Purpose | Status Code |
|----------|---------|------------|
| `/health` | Overall health | 200/503/500 |
| `/ready` | Readiness probe | 200/503 |
| `/live` | Liveness probe | 200 |
| `/metrics` | Prometheus metrics | 200 |

### Logging Configuration

Edit `.env` to control logging:

```bash
LOG_LEVEL=info              # debug, info, warn, error
LOG_FORMAT=json             # json or text
ENABLE_METRICS=true         # Enable metrics collection
SENTRY_DSN=                 # Optional: error tracking service
```

## Security

### Best Practices

1. **Environment Variables**
   - Never commit `.env` to git
   - Use `.env.example` as template
   - Rotate secrets regularly

2. **SSL/TLS**
   - Use HTTPS in production
   - Enable HSTS header
   - Keep certificates updated

3. **Database**
   - Use strong passwords
   - Enable SSL for connections
   - Regular backups
   - Limit access via firewall

4. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use API keys for external access
   - Log suspicious activities

5. **Docker Security**
   - Use Alpine Linux (small attack surface)
   - Non-root user in containers
   - Read-only filesystems where possible
   - Scan images for vulnerabilities

### Security Headers

Nginx automatically sets:
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Port already in use
lsof -i :3000

# 2. Database not ready
docker-compose ps

# 3. Environment variables missing
cat .env | grep required-var
```

### Database Connection Issues

```bash
# Test connection
docker-compose exec postgres pg_isready -U postgres

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Verify credentials
docker-compose exec postgres psql -U postgres -c "SELECT 1;"
```

### High Memory Usage

```bash
# Check container memory
docker stats

# Check Node.js heap
curl http://localhost/health | jq '.checks.memory'

# Restart container
docker-compose restart app
```

### Performance Issues

```bash
# Check metrics
curl http://localhost/metrics | grep duration

# Check slow queries
docker-compose logs app | grep "Slow query"

# Check Redis
docker-compose exec redis redis-cli info stats
```

### Backup Issues

```bash
# Check backup directory permissions
ls -la backups/

# Test restore process
bash scripts/backup-db.sh
bash scripts/restore-db.sh backups/latest.sql.gz

# Check disk space
df -h backups/
```

## Maintenance

### Regular Tasks

- **Daily**: Monitor logs and metrics
- **Weekly**: Review application performance
- **Monthly**: Update dependencies, test backups
- **Quarterly**: Security audit, capacity planning

### Update Procedures

```bash
# Update dependencies
npm update

# Build and test
npm run build
npm test

# Deploy
docker-compose down
docker-compose build
docker-compose up -d
```

### Cleanup

```bash
# Remove old logs
make logs-clean

# Remove old backups (> 30 days)
find backups/ -mtime +30 -delete

# Clean Docker system
docker system prune -f
```

## Support & Documentation

- Application README: [README.md](./README.md)
- Configuration: [src/config/index.ts](./src/config/index.ts)
- Monitoring: [src/monitoring/](./src/monitoring/)
- Scripts: [scripts/](./scripts/)

---

**Last Updated**: 2024
**Environment**: Production Ready
**Status**: Maintained
