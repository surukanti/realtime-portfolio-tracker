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

### Explore Demo Portfolio

The app comes with 6 demo stocks pre-loaded:
- **AAPL** (Apple Inc.) - 10 shares at $150
- **GOOGL** (Alphabet Inc.) - 5 shares at $2800
- **MSFT** (Microsoft) - 8 shares at $300
- **TSLA** (Tesla Inc.) - 15 shares at $200
- **JPM** (JPMorgan Chase) - 12 shares at $180
- **JNJ** (Johnson & Johnson) - 20 shares at $140

Or add your own stock:

### Watch Live Prices

1. Click "▶️ Start Price Stream" (demo stocks are already loaded!)
2. Watch prices update in real-time from all 10 available stocks! 📊
3. Try adding more stocks to see even more price action

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
- 10 stocks are pre-configured (AAPL, GOOGL, MSFT, AMZN, TSLA, META, NVDA, NFLX, JPM, JNJ)
- Check `backend/internal/stream/price_manager.go` to add more stocks

## 📚 Learn More

- [Full Setup Guide](SETUP.md)
- [Project Checklist](PROJECT_CHECKLIST.md)
- [gRPC Documentation](https://grpc.io/docs/)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)

---

**Questions?** Open an issue on GitHub!

**Enjoy building! 🚀**