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
docker-compose up --build
```

**That's it!** 🎉

Wait 30-60 seconds for services to start, then open:

**👉 http://localhost:3000**

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
# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Restart
docker-compose restart

# Clean up everything
docker-compose down -v
```

## 🧪 Test gRPC Directly

Install grpcurl (optional):
```bash
# macOS
brew install grpcurl

# Test the server
grpcurl -plaintext -d '{"user_id": "demo-user-1"}' \
    localhost:50051 portfolio.PortfolioService/GetPortfolio
```

## 📱 What You Get

- ✅ **Backend**: Go gRPC server (port 50051)
- ✅ **Frontend**: React app (port 3000)
- ✅ **Database**: PostgreSQL with demo data
- ✅ **Cache**: Redis for price caching
- ✅ **Proxy**: Envoy for gRPC-Web (port 8081)

## 🐛 Troubleshooting

### Port Already in Use?

```bash
# Change ports in docker-compose.yml
# Or kill the process:
lsof -ti:3000 | xargs kill -9
```

### Services Won't Start?

```bash
# Clean docker and try again
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
2. ✅ **Modify proto**: Edit `proto/portfolio.proto` and regenerate
3. ✅ **Add features**: Follow the `PROJECT_CHECKLIST.md`
4. ✅ **Deploy**: See `SETUP.md` for production deployment

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