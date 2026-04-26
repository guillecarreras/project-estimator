.PHONY: help build dev test lint clean docker-build docker-up docker-down docker-logs migrate backup restore deploy healthcheck

# Variables
DOCKER_COMPOSE_DEV := docker-compose
DOCKER_COMPOSE_PROD := docker-compose -f docker-compose.prod.yml
APP_NAME := project-estimator
IMAGE_NAME := project-estimator

help:
	@echo "$(APP_NAME) - Makefile commands"
	@echo ""
	@echo "Development:"
	@echo "  make install        - Install dependencies"
	@echo "  make dev           - Run development server with hot reload"
	@echo "  make build         - Build TypeScript"
	@echo "  make test          - Run tests"
	@echo "  make lint          - Run linter"
	@echo "  make clean         - Clean build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build  - Build Docker images"
	@echo "  make docker-up     - Start containers (development)"
	@echo "  make docker-prod   - Start containers (production)"
	@echo "  make docker-down   - Stop containers"
	@echo "  make docker-logs   - View container logs"
	@echo ""
	@echo "Database:"
	@echo "  make migrate       - Run database migrations"
	@echo "  make backup        - Backup database"
	@echo "  make restore FILE= - Restore database from backup"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-staging - Deploy to staging"
	@echo "  make deploy-prod    - Deploy to production"
	@echo "  make healthcheck    - Check application health"

# Development commands
install:
	npm ci

dev:
	npm run dev

build:
	npm run build

test:
	npm test --if-present

lint:
	npm run lint --if-present

clean:
	rm -rf dist
	rm -rf coverage
	rm -rf node_modules

# Docker commands
docker-build:
	docker-compose build

docker-up:
	$(DOCKER_COMPOSE_DEV) up -d
	@echo "Development environment started"
	@make healthcheck

docker-down:
	$(DOCKER_COMPOSE_DEV) down

docker-logs:
	$(DOCKER_COMPOSE_DEV) logs -f

docker-shell:
	$(DOCKER_COMPOSE_DEV) exec app sh

docker-prod-build:
	docker-compose -f docker-compose.prod.yml build

docker-prod-up:
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "Production environment started"
	@sleep 5
	@make healthcheck

docker-prod-down:
	$(DOCKER_COMPOSE_PROD) down

docker-prod-logs:
	$(DOCKER_COMPOSE_PROD) logs -f

# Database commands
migrate:
	@echo "Running database migrations..."
	npm run migrate --if-present
	@echo "Migrations completed"

backup:
	@echo "Creating database backup..."
	bash scripts/backup-db.sh
	@echo "Backup completed"

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE variable not set"; \
		echo "Usage: make restore FILE=path/to/backup.sql"; \
		exit 1; \
	fi
	@echo "Restoring database from $(FILE)..."
	bash scripts/restore-db.sh $(FILE)
	@echo "Restore completed"

db-shell:
	$(DOCKER_COMPOSE_DEV) exec postgres psql -U postgres -d project_estimator

# Deployment commands
deploy-staging:
	@echo "Deploying to staging..."
	git push staging develop
	@echo "Staging deployment initiated"

deploy-prod:
	@echo "Deploying to production..."
	git push origin main
	@echo "Production deployment initiated"

# Health check
healthcheck:
	@echo "Checking application health..."
	@curl -s http://localhost:3000/health | jq . || echo "Application not responding"
	@curl -s http://localhost:3000/ready | jq . || echo "Application not ready"

# Docker cleanup
docker-clean:
	docker system prune -f
	docker volume prune -f

# All-in-one setup
setup: clean install docker-build docker-up migrate
	@echo "Setup completed successfully"

# Development with live reload
dev-watch:
	npm run dev -- --watch

# Full build and test
full-test: clean install lint build test

# Environment setup
env-setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env file created from .env.example"; \
		echo "Please update .env with your configuration"; \
	fi

# Metrics and monitoring
metrics:
	@curl -s http://localhost:9090/metrics | head -50

# Logs cleanup
logs-clean:
	rm -rf logs/*
	@echo "Logs cleaned"

# Show git status before deployment
pre-deploy-check:
	@echo "Checking git status..."
	@git status
	@echo "Checking for uncommitted changes..."
	@if [ -n "$$(git status --short)" ]; then \
		echo "Error: Uncommitted changes found"; \
		exit 1; \
	fi
	@echo "Ready for deployment"
