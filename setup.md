# 🚀 Setup Guide - Real-Time Portfolio Tracker

Complete step-by-step guide to get the project running.

## Prerequisites

Make sure you have the following installed:

- **Go 1.21+**: [Download](https://golang.org/dl/)
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Docker & Docker Compose**: [Download](https://www.docker.com/get-started)
- **Protocol Buffers Compiler (protoc)**: See installation below

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
# Go plugins
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$(go env GOPATH)/bin"

# gRPC-Web plugin (for frontend)
npm install -g grpc-tools grpc_tools_node_protoc_ts
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

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/realtime-portfolio-tracker.git
cd realtime-portfolio-tracker
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Alpha Vantage API key (free from https://www.alphavantage.co/support/#api-key):
```
ALPHA_VANTAGE_API_KEY=your_key_here
```

### 3. Generate Protocol Buffer Code

**For Backend (Go):**
```bash
cd backend
mkdir -p pkg/pb

protoc --go_out=./pkg/pb --go_opt=paths=source_relative \
    --go-grpc_out=./pkg/pb --go-grpc_opt=paths=source_relative \
    ../proto/portfolio.proto
```

**For Frontend (JavaScript):**
```bash
cd frontend

# Install protoc plugins if not done
npm install -g grpc-tools

# Generate JS code
protoc -I=../proto portfolio.proto \
    --js_out=import_style=commonjs:./src/proto \
    --grpc-web_out=import_style=commonjs,mode=grpcwebtext:./src/proto
```

## 🐳 Running with Docker (Recommended)

This is the easiest way to get everything running.

```bash
# From project root
docker-compose up --build

# To run in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

The services will be available at:
- **Frontend**: http://localhost:3000
- **Backend gRPC**: localhost:50051
- **Backend gRPC-Web**: http://localhost:8081

## 💻 Running Manually (Development)

### Start PostgreSQL and Redis

```bash
docker-compose up postgres redis -d
```

### Run Backend

```bash
cd backend

# Install dependencies
go mod download

# Run migrations (if needed)
psql -h localhost -U portfolio_user -d portfolio_db -f migrations/001_init.sql

# Run server
go run cmd/server/main.go
```

You should see:
```
✓ Connected to PostgreSQL
✓ Connected to Redis
📊 Price Manager started
🚀 gRPC Server listening on :50051
```

### Run Envoy Proxy (for gRPC-Web)

```bash
docker run -d -v "$(pwd)/envoy.yaml:/etc/envoy/envoy.yaml:ro" \
    -p 8081:8081 -p 9901:9901 \
    envoyproxy/envoy:v1.28-latest
```

### Run Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open at http://localhost:3000

## 🧪 Testing the gRPC Server

### Using grpcurl

Install grpcurl:
```bash
# macOS
brew install grpcurl

# Go install
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

Test the server:
```bash
# List services
grpcurl -plaintext localhost:50051 list

# Get portfolio
grpcurl -plaintext -d '{"user_id": "demo-user-1"}' \
    localhost:50051 portfolio.PortfolioService/GetPortfolio

# Add a stock
grpcurl -plaintext -d '{
    "user_id": "demo-user-1",
    "symbol": "AAPL",
    "quantity": 10,
    "purchase_price": 150.00,
    "purchase_date": 1234567890
}' localhost:50051 portfolio.PortfolioService/AddStock

# Stream prices (Ctrl+C to stop)
grpcurl -plaintext -d '{
    "user_id": "demo-user-1",
    "symbols": ["AAPL", "GOOGL", "MSFT"]
}' localhost:50051 portfolio.PortfolioService/StreamPrices
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
# Backend
docker-compose logs -f backend

# All services
docker-compose logs -f

# Envoy admin interface
open http://localhost:9901
```

### Redis CLI

```bash
docker exec -it portfolio-redis redis-cli

# View cached prices
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
# Build all services
docker-compose -f docker-compose.prod.yml build

# Push to registry
docker tag portfolio-backend:latest your-registry/portfolio-backend:v1.0
docker push your-registry/portfolio-backend:v1.0
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