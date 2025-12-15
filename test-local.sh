#!/bin/bash

# Test script for local gRPC backend development
# This script helps test the backend locally without Docker

set -e

echo "🧪 Testing Local gRPC Backend Setup"
echo "===================================="
echo ""

# Check prerequisites
echo "1. Checking prerequisites..."
command -v go >/dev/null 2>&1 || { echo "❌ Go is not installed"; exit 1; }
command -v protoc >/dev/null 2>&1 || { echo "❌ protoc is not installed"; exit 1; }
echo "✅ Prerequisites met"
echo ""

# Check if proto files are generated
echo "2. Checking proto files..."
if [ ! -f "backend/pkg/pb/portfolio.pb.go" ]; then
    echo "⚠️  Proto files not found. Generating..."
    export PATH="$(go env GOPATH)/bin:$PATH"
    make proto-backend
fi
echo "✅ Proto files ready"
echo ""

# Check if dependencies are installed
echo "3. Checking Go dependencies..."
cd backend
go mod download
go mod tidy
echo "✅ Dependencies ready"
echo ""

# Build the server
echo "4. Building backend server..."
go build -o /tmp/portfolio-server ./cmd/server
echo "✅ Build successful"
echo ""

# Check if Docker services are running
echo "5. Checking Docker services..."
if ! docker ps | grep -q portfolio-postgres; then
    echo "⚠️  PostgreSQL not running. Starting services..."
    cd ..
    docker-compose up -d postgres redis
    echo "⏳ Waiting for services to be ready..."
    sleep 10
fi
echo "✅ Docker services ready"
echo ""

echo "✅ All checks passed!"
echo ""
echo "To run the server locally:"
echo "  cd backend"
echo "  DB_HOST=localhost DB_PORT=5432 DB_USER=portfolio_user DB_PASSWORD=portfolio_pass DB_NAME=portfolio_db REDIS_HOST=localhost REDIS_PORT=6379 GRPC_PORT=50051 go run cmd/server/main.go"
echo ""
echo "Or use the built binary:"
echo "  DB_HOST=localhost DB_PORT=5432 DB_USER=portfolio_user DB_PASSWORD=portfolio_pass DB_NAME=portfolio_db REDIS_HOST=localhost REDIS_PORT=6379 GRPC_PORT=50051 /tmp/portfolio-server"
echo ""
echo "To test with grpcurl:"
echo "  grpcurl -plaintext -d '{\"user_id\": \"demo-user-1\"}' localhost:50051 portfolio.PortfolioService/GetPortfolio"

