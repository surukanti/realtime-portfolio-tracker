# 🚀 Setup Guide - Real-Time Portfolio Tracker

Complete step-by-step guide to get the project running.

## Prerequisites

Make sure you have the following installed:

- **Go 1.24+**: [Download](https://golang.org/dl/)
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Docker & Docker Compose**: [Download](https://www.docker.com/get-started)
- **Protocol Buffers Compiler (protoc)**: See installation below

### Quick Check

```bash
# Run system health check
make doctor
```

### Installing protoc

**macOS:**
```bash
brew install protobuf
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y protobuf-compiler
```

**Windows:**
Download from [GitHub Releases](https://github.com/protocolbuffers/protobuf/releases)

### Installing gRPC Tools

```bash
# Install all required tools automatically
make install-tools

# This installs:
# - protoc-gen-go, protoc-gen-go-grpc (Go)
# - grpc-tools (Node.js)
# - grpcurl (testing)
# - Code quality tools (golangci-lint, staticcheck, etc.)
```

Or install manually:

```bash
# Go plugins
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$(go env GOPATH)/bin"

# gRPC-Web plugin (for frontend)
npm install -g grpc-tools
```

## 📁 Project Structure

```
realtime-portfolio-tracker/
├── proto/                      # Protocol Buffer definitions
│   └── portfolio.proto
├── backend/                    # Go gRPC server
│   ├── cmd/server/
│   ├── internal/
│   │   ├── service/
│   │   ├── repository/
│   │   └── stream/
│   ├── pkg/pb/                # Generated proto files
│   ├── migrations/
│   └── Dockerfile
├── frontend/                   # React application
│   ├── src/
│   │   ├── proto/            # Generated JS proto files
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── envoy.yaml
└── .env
```

## 🔧 Setup Steps

### Quick Setup (Recommended)

```bash
# Clone and complete setup in one command
git clone https://github.com/yourusername/realtime-portfolio-tracker.git
cd realtime-portfolio-tracker

# Complete setup (environment, dependencies, proto generation, build)
make setup
```

### Manual Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/realtime-portfolio-tracker.git
cd realtime-portfolio-tracker
```

### 2. Setup Environment Variables

```bash
# Check and setup environment
make env-check

# Edit .env and add your Alpha Vantage API key (free from https://www.alphavantage.co/support/#api-key)
# ALPHA_VANTAGE_API_KEY=your_key_here
```

### 3. Install Dependencies and Generate Code

```bash
# Install all dependencies
make install

# Generate protocol buffer code for all components
make proto
```

Or manually:

**For Backend (Go):**
```bash
make install-backend proto-backend
```

**For Frontend (JavaScript):**
```bash
make install-frontend proto-frontend
```

## 🐳 Running with Docker (Recommended)

This is the easiest way to get everything running.

```bash
# Build and start all services
make up

# Or build first, then start
make build up

# View logs
make logs

# View specific service logs
make logs-backend

# Stop everything
make down
```

The services will be available at:
- **Frontend**: http://localhost:3000
- **gRPC-Web API**: http://localhost:8081
- **Backend gRPC**: localhost:50052
- **Envoy Admin Interface**: http://localhost:9901
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 💻 Running Manually (Development)

### Start Infrastructure Services

```bash
# Start databases and proxy
make up postgres redis envoy

# Or manually
docker-compose up postgres redis envoy -d
```

### Run Backend

```bash
# Install dependencies and run in development mode
make install-backend dev-backend

# Or manually:
cd backend
go mod download
go run cmd/server/main.go
```

You should see:
```
✓ Connected to PostgreSQL
✓ Connected to Redis
📊 Price Manager started
🚀 gRPC Server listening on :50051
```

### Run Frontend

```bash
# Install dependencies and run in development mode
make install-frontend dev-frontend

# Or manually:
cd frontend
npm install
npm start
```

Frontend will open at http://localhost:3000

### Run Full Development Stack

```bash
# Start everything in development mode
make dev-full
```

## 🧪 Testing the gRPC Server

### Using Makefile Commands

```bash
# Install grpcurl and other tools
make install-tools

# Check gRPC service health
make grpc-health

# List all services
make grpc-list

# Test basic functionality
make grpc-test
```

### Manual Testing with grpcurl

```bash
# List services (note: port 50052 when using Docker)
grpcurl -plaintext localhost:50052 list

# Get portfolio
grpcurl -plaintext -d '{"user_id": "demo-user-1"}' \
    localhost:50052 portfolio.PortfolioService/GetPortfolio

# Add a stock
grpcurl -plaintext -d '{
    "user_id": "demo-user-1",
    "symbol": "AAPL",
    "quantity": 10,
    "purchase_price": 150.00,
    "purchase_date": 1234567890
}' localhost:50052 portfolio.PortfolioService/AddStock

# Stream prices (Ctrl+C to stop)
grpcurl -plaintext -d '{
    "user_id": "demo-user-1",
    "symbols": ["AAPL", "GOOGL", "MSFT"]
}' localhost:50052 portfolio.PortfolioService/StreamPrices
```

### Using BloomRPC

1. Download [BloomRPC](https://github.com/bloomrpc/bloomrpc)
2. Import `proto/portfolio.proto`
3. Set server address to `localhost:50051`
4. Test all methods with GUI

## 📝 Database Access

Connect to PostgreSQL:
```bash
docker exec -it portfolio-postgres psql -U portfolio_user -d portfolio_db
```

Useful queries:
```sql
-- View all stocks
SELECT * FROM stocks;

-- View price alerts
SELECT * FROM price_alerts;

-- View users
SELECT * FROM users;
```

## 🔍 Monitoring

### View Application Logs

```bash
# All services
make logs

# Backend only
make logs-backend

# Database logs
make logs-db

# Envoy proxy logs
make logs-envoy

# Envoy admin interface
open http://localhost:9901
```

### Database and Cache Access

```bash
# PostgreSQL shell
make db-shell

# Check database status
make db-status

# Redis CLI
make redis-shell

# View cached prices in Redis
redis-cli
KEYS price:*
GET price:AAPL
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port 50051
lsof -ti:50051 | xargs kill -9

# Or use different port in .env
GRPC_PORT=50052
```

### Proto Generation Errors

```bash
# Ensure protoc is installed
protoc --version

# Ensure Go plugins are installed
which protoc-gen-go
which protoc-gen-go-grpc
```

### Database Connection Issues

```bash
# Wait for database to be ready
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres -d
```

### gRPC-Web CORS Issues

Check `envoy.yaml` configuration. Ensure Envoy is running:
```bash
docker ps | grep envoy
```

## 🚢 Production Deployment

### Build Production Images

```bash
# Build production images
make build-prod

# Or manually:
docker-compose -f docker-compose.prod.yml build

# Deploy to development
make deploy-dev

# Deploy to production (when configured)
make deploy-prod
```

### Environment Variables for Production

```bash
# Use secure passwords
DB_PASSWORD=strong_password_here
REDIS_PASSWORD=another_strong_password

# Use real API key
ALPHA_VANTAGE_API_KEY=your_production_key

# Configure TLS
GRPC_TLS_CERT=/path/to/cert.pem
GRPC_TLS_KEY=/path/to/key.pem
```

### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests (to be added).

## 📚 Next Steps

1. **Add Authentication**: Implement JWT-based auth
2. **Real Market Data**: Integrate Alpha Vantage API properly
3. **WebSocket Fallback**: For browsers without gRPC-Web support
4. **Mobile App**: Build React Native client
5. **Advanced Features**: Technical indicators, portfolio optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙏 Support

- Star this repo if you find it helpful!
- Report issues on GitHub
- Contribute improvements via PR

---

**Happy coding! 🚀**