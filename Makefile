.PHONY: help proto build up down logs test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

proto: ## Generate protobuf code for backend and frontend
	@echo "Generating protobuf code..."
	@cd backend && mkdir -p pkg/pb && \
		protoc --go_out=./pkg/pb --go_opt=paths=source_relative \
		--go-grpc_out=./pkg/pb --go-grpc_opt=paths=source_relative \
		../proto/portfolio.proto
	@cd frontend && mkdir -p src/proto && \
		protoc -I=../proto portfolio.proto \
		--js_out=import_style=commonjs:./src/proto \
		--grpc-web_out=import_style=commonjs,mode=grpcwebtext:./src/proto
	@echo "✓ Proto files generated"

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d
	@echo "✓ Services started"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend gRPC: localhost:50051"
	@echo "Backend gRPC-Web: http://localhost:8081"

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

test-backend: ## Run backend tests
	cd backend && go test ./...

test-frontend: ## Run frontend tests
	cd frontend && npm test

db-shell: ## Open PostgreSQL shell
	docker exec -it portfolio-postgres psql -U portfolio_user -d portfolio_db

redis-shell: ## Open Redis CLI
	docker exec -it portfolio-redis redis-cli

clean: ## Clean up generated files and Docker volumes
	docker-compose down -v
	rm -rf backend/pkg/pb/*
	rm -rf frontend/src/proto/*
	@echo "✓ Cleaned up"

dev-backend: ## Run backend in development mode
	cd backend && go run cmd/server/main.go

dev-frontend: ## Run frontend in development mode
	cd frontend && npm start

install: ## Install all dependencies
	cd backend && go mod download
	cd frontend && npm install
	@echo "✓ Dependencies installed"

grpcurl-list: ## List gRPC services
	grpcurl -plaintext localhost:50051 list

grpcurl-portfolio: ## Get demo portfolio
	grpcurl -plaintext -d '{"user_id": "demo-user-1"}' \
		localhost:50051 portfolio.PortfolioService/GetPortfolio

docker-prune: ## Remove unused Docker resources
	docker system prune -af --volumes

restart: down up ## Restart all services