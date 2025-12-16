# ⚡ Quick Start Guide - 5 Minutes to Running App

Get the Real-Time Portfolio Tracker running in 5 minutes!

## Prerequisites Check ✅

```bash
# Check if Docker is installed
docker --version

# Check if Docker Compose is installed
docker-compose --version
```

If you don't have Docker, [install it here](https://www.docker.com/get-started).

## 🚀 Three Commands to Success

### 1️⃣ Clone & Navigate

```bash
git clone https://github.com/yourusername/realtime-portfolio-tracker.git
cd realtime-portfolio-tracker
```

### 2️⃣ Setup Environment

```bash
cp .env.example .env
# Edit .env if you want, but defaults work fine for demo
```

### 3️⃣ Start Everything

```bash
# Complete setup and start services
make setup up
```

**That's it!** 🎉

Wait 30-60 seconds for services to start, then open:

**👉 http://localhost:3000**

### Alternative Quick Commands

```bash
# If you prefer Docker Compose directly
docker-compose up --build

# Or use the Makefile
make up
```

## 🎮 Using the App

### Add Your First Stock

1. In the "Add New Stock" section:
   - Symbol: `AAPL`
   - Quantity: `10`
   - Purchase Price: `150`
2. Click "Add Stock"

### Watch Live Prices

1. Add a few more stocks (GOOGL, MSFT, TSLA)
2. Click "▶️ Start Price Stream"
3. Watch prices update in real-time! 📊

## 🔧 Quick Commands

```bash
# View all logs
make logs

# View backend logs only
make logs-backend

# Stop everything
make down

# Restart all services
make restart

# Clean up everything (containers + volumes)
make clean

# View service health
make health
```

## 🧪 Test gRPC Directly

```bash
# Install grpcurl (included in make install-tools)
make install-tools

# Check gRPC service health
make grpc-health

# List all available services
make grpc-list

# Test portfolio retrieval
make grpc-test
```

Or manually:
```bash
# Test the server (note: port is 50052 in Docker setup)
grpcurl -plaintext -d '{"user_id": "demo-user-1"}' \
    localhost:50052 portfolio.PortfolioService/GetPortfolio
```

## 📱 What You Get

- ✅ **Frontend**: React app (http://localhost:3000)
- ✅ **Backend**: Go gRPC server (localhost:50052)
- ✅ **gRPC-Web Proxy**: Envoy gateway (http://localhost:8081)
- ✅ **Database**: PostgreSQL (localhost:5432)
- ✅ **Cache**: Redis (localhost:6379)
- ✅ **Admin Interface**: Envoy admin (http://localhost:9901)

## 🐛 Troubleshooting

### Port Already in Use?

```bash
# Change ports in docker-compose.yml
# Or kill the process:
lsof -ti:3000 | xargs kill -9
```

### Services Won't Start?

```bash
# Clean everything and restart
make clean-all
make up

# Or manually:
docker-compose down -v
docker-compose up --build
```

### Database Connection Errors?

```bash
# Wait longer, database takes ~10 seconds to initialize
# Check logs:
docker-compose logs postgres
```

## 🎯 Next Steps

1. ✅ **Explore the code**: Check out `backend/internal/service/portfolio_service.go`
2. ✅ **Modify proto**: Edit `proto/portfolio.proto` and run `make proto`
3. ✅ **Run tests**: Use `make test` to run all tests
4. ✅ **Check code quality**: Run `make lint` and `make format`
5. ✅ **Add features**: Follow the `PROJECT_CHECKLIST.md`
6. ✅ **Deploy**: See `SETUP.md` for production deployment

## 💡 Pro Tips

- Demo user ID is: `demo-user-1`
- Prices update every 2 seconds
- 8 stocks are pre-configured (AAPL, GOOGL, MSFT, AMZN, TSLA, META, NVDA, NFLX)
- Check `backend/internal/stream/price_manager.go` to add more stocks

## 📚 Learn More

- [Full Setup Guide](SETUP.md)
- [Project Checklist](PROJECT_CHECKLIST.md)
- [gRPC Documentation](https://grpc.io/docs/)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)

---

**Questions?** Open an issue on GitHub!

**Enjoy building! 🚀**