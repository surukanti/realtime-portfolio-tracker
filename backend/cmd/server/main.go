package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	pb "github.com/yourusername/realtime-portfolio-tracker/backend/pkg/pb"
	"github.com/yourusername/realtime-portfolio-tracker/backend/internal/repository"
	"github.com/yourusername/realtime-portfolio-tracker/backend/internal/service"
	"github.com/yourusername/realtime-portfolio-tracker/backend/internal/stream"
)

func main() {
	log.Println("Starting Portfolio Tracker gRPC Server...")

	// Load configuration from environment
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "portfolio_user")
	dbPass := getEnv("DB_PASSWORD", "portfolio_pass")
	dbName := getEnv("DB_NAME", "portfolio_db")
	redisHost := getEnv("REDIS_HOST", "localhost")
	redisPort := getEnv("REDIS_PORT", "6379")
	grpcPort := getEnv("GRPC_PORT", "50051")

	// Connect to PostgreSQL
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPass, dbName)
	
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Wait for database to be ready
	for i := 0; i < 30; i++ {
		if err := db.Ping(); err == nil {
			log.Println("✓ Connected to PostgreSQL")
			break
		}
		log.Printf("Waiting for database... (%d/30)", i+1)
		time.Sleep(2 * time.Second)
	}

	// Connect to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", redisHost, redisPort),
	})
	defer rdb.Close()

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("✓ Connected to Redis")

	// Initialize repositories
	stockRepo := repository.NewStockRepository(db)
	alertRepo := repository.NewAlertRepository(db)

	// Initialize price manager (handles streaming and caching)
	priceManager := stream.NewPriceManager(rdb)
	go priceManager.Start(ctx)

	// Initialize gRPC service
	portfolioService := service.NewPortfolioService(stockRepo, alertRepo, priceManager)

	// Create gRPC server
	grpcServer := grpc.NewServer(
		grpc.MaxConcurrentStreams(1000),
	)
	pb.RegisterPortfolioServiceServer(grpcServer, portfolioService)

	// Register reflection service for grpcurl testing
	reflection.Register(grpcServer)

	// Start listening
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", grpcPort))
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	// Handle graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("🚀 gRPC Server listening on :%s", grpcPort)
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("Failed to serve: %v", err)
		}
	}()

	<-stop
	log.Println("\n🛑 Shutting down gracefully...")
	grpcServer.GracefulStop()
	log.Println("✓ Server stopped")
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}