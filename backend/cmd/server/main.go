package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"

	"github.com/chinnareddy578/realtime-portfolio-tracker/backend/internal/repository"
	"github.com/chinnareddy578/realtime-portfolio-tracker/backend/internal/service"
	"github.com/chinnareddy578/realtime-portfolio-tracker/backend/internal/stream"
)

func main() {
	log.Println("Starting Portfolio Tracker HTTP Server...")

	// Load configuration from environment
	httpPort := getEnv("HTTP_PORT", "8080")

	// Use mock mode
	log.Println("⚠️  Using mock data mode for testing")

	// Initialize repositories (use mock repos)
	var stockRepo *repository.StockRepository
	var alertRepo *repository.AlertRepository
	stockRepo = nil
	alertRepo = nil

	// Initialize price manager (mock mode)
	var priceManager *stream.PriceManager
	priceManager = nil

	// Initialize HTTP service
	portfolioService := service.NewPortfolioService(stockRepo, alertRepo, priceManager)

	// Create HTTP server with Gorilla Mux
	router := mux.NewRouter()

	// CORS wrapper function
	corsWrapper := func(handler http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			handler(w, r)
		}
	}

	// API routes with CORS
	router.HandleFunc("/api/portfolio", corsWrapper(portfolioService.GetPortfolioHTTP)).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/stocks", corsWrapper(portfolioService.AddStockHTTP)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/alerts", corsWrapper(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			portfolioService.GetAlertsHTTP(w, r)
		} else if r.Method == "POST" {
			portfolioService.SetAlertHTTP(w, r)
		} else if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})).Methods("GET", "POST", "OPTIONS")
	router.HandleFunc("/api/charts", corsWrapper(portfolioService.GetChartDataHTTP)).Methods("GET", "OPTIONS")

	// Handle graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", httpPort),
		Handler: router,
	}

	go func() {
		log.Printf("🚀 HTTP Server listening on :%s", httpPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to serve: %v", err)
		}
	}()

	<-stop
	log.Println("\n🛑 Shutting down gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}
	log.Println("✓ Server stopped")
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
