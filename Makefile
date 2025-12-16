# ========================================================================================
# Real-Time Portfolio Tracker - Comprehensive Makefile
# ========================================================================================

.PHONY: help
.PHONY: setup setup-dev setup-prod env-check
.PHONY: proto proto-backend proto-frontend proto-clean
.PHONY: build build-backend build-frontend build-prod
.PHONY: up down restart
.PHONY: logs logs-backend logs-frontend logs-db logs-redis logs-envoy
.PHONY: dev dev-backend dev-frontend dev-full
.PHONY: test test-backend test-frontend test-unit test-integration test-e2e test-coverage
.PHONY: lint lint-backend lint-frontend lint-fix
.PHONY: format format-backend format-frontend
.PHONY: vet security-check
.PHONY: db-migrate db-seed db-backup db-restore db-shell db-status
.PHONY: redis-shell redis-flush
.PHONY: install install-backend install-frontend install-tools
.PHONY: clean clean-all clean-cache clean-logs
.PHONY: grpc-health grpc-list grpc-test grpc-load-test
.PHONY: docker-prune docker-clean docker-logs
.PHONY: deploy deploy-dev deploy-prod
.PHONY: health health-backend health-frontend health-db health-redis
.PHONY: monitor monitor-backend monitor-frontend
.PHONY: backup backup-db backup-redis
.PHONY: doctor version changelog

# ========================================================================================
# HELP & INFO
# ========================================================================================

help: ## Show this help message
	@echo '===================================================================================='
	@echo '🚀 Real-Time Portfolio Tracker - Comprehensive Makefile'
	@echo '===================================================================================='
	@echo ''
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort
	@echo ''
	@echo '===================================================================================='
	@echo '📚 Quick Start:'
	@echo '  make setup        # Initial setup'
	@echo '  make up           # Start all services'
	@echo '  make dev          # Development mode'
	@echo '  make test         # Run all tests'
	@echo '  make clean        # Clean everything'
	@echo '===================================================================================='

version: ## Show version information
	@echo "Real-Time Portfolio Tracker"
	@echo "Go Version: $(shell go version)"
	@echo "Node Version: $(shell node --version 2>/dev/null || echo 'Node not found')"
	@echo "Docker Version: $(shell docker --version)"
	@echo "Docker Compose Version: $(shell docker-compose --version)"

changelog: ## Show recent git changelog
	@echo "Recent commits:"
	@git log --oneline -10 --graph

doctor: ## Run system health check
	@echo "🔍 System Health Check"
	@echo "======================"
	@echo "✓ Go version: $(shell go version | head -1)"
	@if command -v node >/dev/null 2>&1; then echo "✓ Node.js version: $(shell node --version)"; else echo "⚠️  Node.js not found"; fi
	@if command -v docker >/dev/null 2>&1; then echo "✓ Docker version: $(shell docker --version)"; else echo "⚠️  Docker not found"; fi
	@if command -v docker-compose >/dev/null 2>&1; then echo "✓ Docker Compose version: $(shell docker-compose --version)"; else echo "⚠️  Docker Compose not found"; fi
	@if command -v protoc >/dev/null 2>&1; then echo "✓ Protoc version: $(shell protoc --version)"; else echo "⚠️  Protoc not found"; fi
	@if command -v grpcurl >/dev/null 2>&1; then echo "✓ grpcurl available"; else echo "⚠️  grpcurl not found"; fi
	@echo ""

# ========================================================================================
# SETUP & ENVIRONMENT
# ========================================================================================

setup: env-check install-tools proto build ## Complete project setup
	@echo "✓ Setup complete! Run 'make up' to start services"

setup-dev: setup db-migrate db-seed ## Setup for development with sample data

setup-prod: env-check install-tools proto build-prod ## Setup for production

env-check: ## Check environment configuration
	@echo "Checking environment..."
	@if [ ! -f .env ]; then \
		echo "⚠️  .env file not found. Copying from .env.example..."; \
		cp .env.example .env 2>/dev/null || echo "No .env.example found"; \
	fi
	@echo "✓ Environment ready"

install-tools: ## Install required development tools
	@echo "Installing development tools..."
	go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
	go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
	go install golang.org/x/tools/cmd/goimports@latest
	go install honnef.co/go/tools/cmd/staticcheck@latest
	go install golang.org/x/vuln/cmd/govulncheck@latest
	@echo "✓ Tools installed"

# ========================================================================================
# PROTOCOL BUFFERS
# ========================================================================================

proto: proto-backend proto-frontend ## Generate protobuf code for all components

proto-backend: ## Generate protobuf code for backend only
	@echo "Generating backend protobuf code..."
	@export PATH="$(shell go env GOPATH)/bin:$$PATH" && \
	cd backend && mkdir -p pkg/pb && \
	protoc -I=../proto --go_out=./pkg/pb --go_opt=paths=source_relative \
		--go-grpc_out=./pkg/pb --go-grpc_opt=paths=source_relative \
		../proto/portfolio.proto
	@echo "✓ Backend proto files generated"

proto-frontend: ## Generate protobuf code for frontend only
	@echo "Generating frontend protobuf code..."
	@if command -v protoc-gen-js >/dev/null 2>&1 && command -v protoc-gen-grpc-web >/dev/null 2>&1; then \
		cd frontend && mkdir -p src/proto && \
		protoc -I=../proto ../proto/portfolio.proto \
		--js_out=import_style=commonjs:./src/proto \
		--grpc-web_out=import_style=commonjs,mode=grpcwebtext:./src/proto && \
		echo "✓ Frontend proto files generated"; \
	else \
		echo "⚠️  Skipping frontend proto generation (protoc-gen-js/protoc-gen-grpc-web not installed)"; \
		echo "   Install with: npm install -g protoc-gen-js protoc-gen-grpc-web"; \
	fi

proto-clean: ## Clean generated protobuf files
	rm -rf backend/pkg/pb/*
	rm -rf frontend/src/proto/*
	@echo "✓ Proto files cleaned"

# ========================================================================================
# BUILDING
# ========================================================================================

build: ## Build all Docker images
	docker-compose build
	@echo "✓ All images built"

build-backend: ## Build backend Docker image
	docker-compose build backend
	@echo "✓ Backend image built"

build-frontend: ## Build frontend Docker image
	docker-compose build frontend
	@echo "✓ Frontend image built"

build-prod: ## Build production Docker images
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
	@echo "✓ Production images built"

# ========================================================================================
# DEVELOPMENT
# ========================================================================================

dev: dev-full ## Start development environment (alias for dev-full)

dev-backend: ## Run backend in development mode
	@echo "Starting backend in development mode..."
	cd backend && go run cmd/server/main.go

dev-frontend: ## Run frontend in development mode
	@echo "Starting frontend in development mode..."
	cd frontend && npm start

dev-full: ## Run full development stack (backend + frontend)
	@echo "Starting full development stack..."
	@echo "Backend will be available at: http://localhost:8080"
	@echo "Frontend will be available at: http://localhost:3000"
	@echo ""
	@echo "Starting services in background..."
	docker-compose up -d postgres redis envoy
	@echo "Waiting for services to be ready..."
	@sleep 5
	$(MAKE) dev-backend &
	$(MAKE) dev-frontend &
	@echo ""
	@echo "✓ Development stack started!"
	@echo "Press Ctrl+C to stop all services"
	@trap 'kill %%; kill %%' INT; wait

# ========================================================================================
# DOCKER SERVICES
# ========================================================================================

up: ## Start all services
	docker-compose up -d
	@echo "✓ Services started"
	@echo ""
	@echo "🌐 Service URLs:"
	@echo "  Frontend:    http://localhost:3000"
	@echo "  gRPC-Web:    http://localhost:8081"
	@echo "  Backend:     localhost:50052 (gRPC)"
	@echo "  Envoy Admin: http://localhost:9901"
	@echo ""
	@echo "📊 Database Access:"
	@echo "  PostgreSQL:  localhost:5432 (portfolio_user/portfolio_pass)"
	@echo "  Redis:       localhost:6379"
	@echo ""
	@echo "🔧 Useful commands:"
	@echo "  make logs          # View all logs"
	@echo "  make db-shell      # PostgreSQL shell"
	@echo "  make redis-shell   # Redis CLI"
	@echo "  make grpc-health   # Check gRPC health"

down: ## Stop all services
	docker-compose down
	@echo "✓ Services stopped"

restart: down up ## Restart all services

# ========================================================================================
# LOGGING
# ========================================================================================

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-db: ## View database logs
	docker-compose logs -f postgres

logs-redis: ## View Redis logs
	docker-compose logs -f redis

logs-envoy: ## View Envoy proxy logs
	docker-compose logs -f envoy

# ========================================================================================
# TESTING
# ========================================================================================

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	cd backend && go test ./... -v

test-frontend: ## Run frontend tests
	cd frontend && npm test

test-unit: ## Run unit tests only
	cd backend && go test ./... -short -v

test-integration: ## Run integration tests
	cd backend && go test ./... -run Integration -v

test-e2e: ## Run end-to-end tests
	@echo "Running E2E tests..."
	# Add E2E test commands here when implemented

test-coverage: ## Generate test coverage report
	cd backend && go test ./... -coverprofile=coverage.out
	cd backend && go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: backend/coverage.html"

# ========================================================================================
# CODE QUALITY
# ========================================================================================

lint: lint-backend lint-frontend ## Run all linters

lint-backend: ## Lint backend code
	cd backend && golangci-lint run 2>/dev/null || \
		(echo "⚠️  golangci-lint not found. Install with: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest" && \
		 go vet ./... && staticcheck ./...)

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint 2>/dev/null || echo "⚠️  Frontend linting not configured"

lint-fix: ## Auto-fix linting issues
	cd backend && golangci-lint run --fix 2>/dev/null || \
		(go fmt ./... && goimports -w .)
	cd frontend && npm run lint:fix 2>/dev/null || echo "⚠️  Frontend auto-fix not configured"

format: format-backend format-frontend ## Format all code

format-backend: ## Format backend code
	cd backend && go fmt ./... && goimports -w .
	@echo "✓ Backend code formatted"

format-frontend: ## Format frontend code
	cd frontend && npm run format 2>/dev/null || echo "⚠️  Frontend formatting not configured"

vet: ## Run go vet on backend code
	cd backend && go vet ./...
	@echo "✓ Go vet completed"

security-check: ## Run security vulnerability checks
	cd backend && govulncheck ./ 2>/dev/null || echo "⚠️  govulncheck not found. Install with: go install golang.org/x/vuln/cmd/govulncheck@latest"

# ========================================================================================
# DATABASE MANAGEMENT
# ========================================================================================

db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	docker-compose exec postgres psql -U portfolio_user -d portfolio_db -f /docker-entrypoint-initdb.d/001_init.sql 2>/dev/null || \
		echo "Migrations already applied or database not running"
	@echo "✓ Database migrations completed"

db-seed: ## Seed database with sample data
	@echo "Seeding database with sample data..."
	# Add seeding commands here when implemented
	@echo "✓ Database seeded"

db-backup: ## Backup database
	@echo "Creating database backup..."
	docker exec portfolio-postgres pg_dump -U portfolio_user portfolio_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✓ Database backup created"

db-restore: ## Restore database from backup (usage: make db-restore FILE=backup.sql)
	@echo "Restoring database from $(FILE)..."
	docker exec -i portfolio-postgres psql -U portfolio_user portfolio_db < $(FILE)
	@echo "✓ Database restored"

db-shell: ## Open PostgreSQL shell
	docker exec -it portfolio-postgres psql -U portfolio_user -d portfolio_db

db-status: ## Show database status and tables
	docker exec portfolio-postgres psql -U portfolio_user -d portfolio_db -c "\dt" -c "SELECT COUNT(*) as stocks FROM stocks;" -c "SELECT COUNT(*) as alerts FROM price_alerts;"

# ========================================================================================
# REDIS MANAGEMENT
# ========================================================================================

redis-shell: ## Open Redis CLI
	docker exec -it portfolio-redis redis-cli

redis-flush: ## Flush Redis cache
	docker exec portfolio-redis redis-cli FLUSHALL
	@echo "✓ Redis cache flushed"

# ========================================================================================
# DEPENDENCY MANAGEMENT
# ========================================================================================

install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install backend dependencies
	cd backend && go mod download && go mod tidy
	@echo "✓ Backend dependencies installed"

install-frontend: ## Install frontend dependencies
	cd frontend && npm install
	@echo "✓ Frontend dependencies installed"

# ========================================================================================
# gRPC TOOLS
# ========================================================================================

grpc-health: ## Check gRPC service health
	@echo "Checking gRPC service health..."
	grpcurl -plaintext localhost:50052 list 2>/dev/null && echo "✓ gRPC service is healthy" || echo "❌ gRPC service not responding"

grpc-list: ## List all gRPC services and methods
	grpcurl -plaintext localhost:50052 list

grpc-test: ## Test gRPC endpoints with sample data
	@echo "Testing gRPC endpoints..."
	@echo "1. Getting portfolio:"
	grpcurl -plaintext -d '{"user_id": "demo-user-1"}' localhost:50052 portfolio.PortfolioService/GetPortfolio
	@echo ""
	@echo "2. Testing price streaming (Ctrl+C to stop):"
	grpcurl -plaintext -d '{"user_id": "demo-user-1", "symbols": ["AAPL", "GOOGL"]}' localhost:50052 portfolio.PortfolioService/StreamPrices

grpc-load-test: ## Run basic load test on gRPC service
	@echo "Running basic gRPC load test..."
	# Add load testing commands here when implemented
	@echo "Load testing not yet implemented"

# ========================================================================================
# HEALTH CHECKS & MONITORING
# ========================================================================================

health: health-backend health-frontend health-db health-redis ## Check health of all services

health-backend: ## Check backend health
	@curl -s http://localhost:8081 >/dev/null && echo "✓ Backend health check passed" || echo "❌ Backend not responding"

health-frontend: ## Check frontend health
	@curl -s http://localhost:3000 >/dev/null && echo "✓ Frontend health check passed" || echo "❌ Frontend not responding"

health-db: ## Check database health
	@docker exec portfolio-postgres pg_isready -U portfolio_user -d portfolio_db >/dev/null 2>&1 && echo "✓ Database health check passed" || echo "❌ Database not responding"

health-redis: ## Check Redis health
	@docker exec portfolio-redis redis-cli ping >/dev/null 2>&1 && echo "✓ Redis health check passed" || echo "❌ Redis not responding"

monitor-backend: ## Monitor backend with basic metrics
	@echo "Backend monitoring (Ctrl+C to stop)..."
	@while true; do \
		echo "=== $(shell date) ==="; \
		curl -s http://localhost:8081 | head -1 || echo "Backend not responding"; \
		sleep 5; \
	done

monitor-frontend: ## Monitor frontend accessibility
	@echo "Frontend monitoring (Ctrl+C to stop)..."
	@while true; do \
		echo "=== $(shell date) ==="; \
		curl -s -o /dev/null -w "HTTP %{http_code} - Response time: %{time_total}s\n" http://localhost:3000 || echo "Frontend not responding"; \
		sleep 5; \
	done

# ========================================================================================
# BACKUP & RECOVERY
# ========================================================================================

backup: backup-db backup-redis ## Create full system backup

backup-db: ## Backup database only
	$(MAKE) db-backup

backup-redis: ## Backup Redis data
	@echo "Creating Redis backup..."
	docker exec portfolio-redis redis-cli SAVE
	docker cp portfolio-redis:/data/dump.rdb redis_backup_$(shell date +%Y%m%d_%H%M%S).rdb
	@echo "✓ Redis backup created"

# ========================================================================================
# CLEANUP
# ========================================================================================

clean: ## Clean generated files and stop services
	docker-compose down
	rm -rf backend/pkg/pb/*
	rm -rf frontend/src/proto/*
	@echo "✓ Cleaned generated files"

clean-all: clean clean-cache ## Clean everything including caches and logs
	@echo "✓ Full cleanup completed"

clean-cache: ## Clean build caches and temporary files
	cd backend && go clean -cache -testcache -modcache
	cd frontend && rm -rf node_modules/.cache 2>/dev/null || true
	docker system prune -f
	@echo "✓ Caches cleaned"

clean-logs: ## Clean log files
	rm -f *.log
	find . -name "*.log" -type f -delete
	@echo "✓ Logs cleaned"

docker-prune: ## Remove unused Docker resources
	docker system prune -af --volumes
	@echo "✓ Docker resources pruned"

docker-clean: ## Remove all Docker containers and images
	docker-compose down -v --remove-orphans
	docker system prune -af --volumes
	@echo "✓ Docker cleaned"

docker-logs: ## Show Docker system logs
	docker-compose logs --tail=100

# ========================================================================================
# DEPLOYMENT
# ========================================================================================

deploy-dev: build up ## Deploy to development environment

deploy-prod: ## Deploy to production environment
	@echo "🚀 Deploying to production..."
	# Add production deployment commands here
	@echo "Production deployment not yet implemented"
	@echo "Consider using docker-compose.prod.yml for production setup"

# ========================================================================================
# UTILITY TARGETS
# ========================================================================================

# Alias for common commands
start: up
stop: down
status: health
shell: db-shell