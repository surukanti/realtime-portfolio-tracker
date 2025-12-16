package stream

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"sync"
	"time"

	pb "github.com/chinnareddy578/realtime-portfolio-tracker/backend/pkg/pb"
	"github.com/redis/go-redis/v9"
)

type PriceManager struct {
	rdb         *redis.Client
	subscribers map[string][]chan *pb.PriceUpdate
	mu          sync.RWMutex
	prices      map[string]*pb.PriceUpdate
	pricesMu    sync.RWMutex
}

func NewPriceManager(rdb *redis.Client) *PriceManager {
	return &PriceManager{
		rdb:         rdb,
		subscribers: make(map[string][]chan *pb.PriceUpdate),
		prices:      make(map[string]*pb.PriceUpdate),
	}
}

// Start begins the price update simulation
func (pm *PriceManager) Start(ctx context.Context) {
	// Initialize some default stocks with base prices
	baseStocks := map[string]float64{
		"AAPL":  175.50, // Apple Inc.
		"GOOGL": 140.25, // Alphabet Inc.
		"MSFT":  380.75, // Microsoft Corporation
		"AMZN":  152.30, // Amazon.com Inc.
		"TSLA":  242.80, // Tesla Inc.
		"META":  485.20, // Meta Platforms Inc.
		"NVDA":  495.60, // NVIDIA Corporation
		"NFLX":  475.90, // Netflix Inc.
		"JPM":   210.45, // JPMorgan Chase & Co.
		"JNJ":   165.80, // Johnson & Johnson
	}

	for symbol, basePrice := range baseStocks {
		pm.prices[symbol] = &pb.PriceUpdate{
			Symbol:       symbol,
			CurrentPrice: basePrice,
			Timestamp:    time.Now().Unix(),
		}
	}

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	log.Println("📊 Price Manager started - simulating price updates")

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			pm.updatePrices()
		}
	}
}

// updatePrices simulates realistic price movements
func (pm *PriceManager) updatePrices() {
	pm.pricesMu.Lock()
	defer pm.pricesMu.Unlock()

	now := time.Now().Unix()

	for symbol, currentPrice := range pm.prices {
		// Simulate price change (-2% to +2%)
		changePercent := (rand.Float64() - 0.5) * 4
		change := currentPrice.CurrentPrice * (changePercent / 100)
		newPrice := currentPrice.CurrentPrice + change

		// Calculate day high/low (simulate)
		dayHigh := newPrice * 1.02
		dayLow := newPrice * 0.98
		volume := rand.Float64() * 10000000

		update := &pb.PriceUpdate{
			Symbol:           symbol,
			CurrentPrice:     newPrice,
			Change:           change,
			ChangePercentage: changePercent,
			Timestamp:        now,
			Volume:           volume,
			DayHigh:          dayHigh,
			DayLow:           dayLow,
		}

		pm.prices[symbol] = update

		// Cache in Redis
		pm.cachePrice(context.Background(), symbol, update)

		// Broadcast to subscribers
		pm.broadcast(symbol, update)
	}
}

// Subscribe adds a subscriber for a symbol
func (pm *PriceManager) Subscribe(symbol string) chan *pb.PriceUpdate {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	ch := make(chan *pb.PriceUpdate, 100)
	pm.subscribers[symbol] = append(pm.subscribers[symbol], ch)

	log.Printf("✓ New subscriber for %s (total: %d)", symbol, len(pm.subscribers[symbol]))

	return ch
}

// Unsubscribe removes a subscriber
func (pm *PriceManager) Unsubscribe(symbol string, ch chan *pb.PriceUpdate) {
	pm.mu.Lock()
	defer pm.mu.Unlock()

	subs := pm.subscribers[symbol]
	for i, sub := range subs {
		if sub == ch {
			close(ch)
			pm.subscribers[symbol] = append(subs[:i], subs[i+1:]...)
			log.Printf("✓ Unsubscribed from %s (remaining: %d)", symbol, len(pm.subscribers[symbol]))
			break
		}
	}
}

// broadcast sends price updates to all subscribers
func (pm *PriceManager) broadcast(symbol string, update *pb.PriceUpdate) {
	pm.mu.RLock()
	defer pm.mu.RUnlock()

	for _, ch := range pm.subscribers[symbol] {
		select {
		case ch <- update:
		default:
			log.Printf("⚠️  Subscriber channel full for %s", symbol)
		}
	}
}

// GetCurrentPrice retrieves the latest price (from cache or memory)
func (pm *PriceManager) GetCurrentPrice(ctx context.Context, symbol string) (*pb.PriceUpdate, error) {
	// Try Redis cache first
	cached, err := pm.rdb.Get(ctx, fmt.Sprintf("price:%s", symbol)).Result()
	if err == nil {
		var price pb.PriceUpdate
		if err := json.Unmarshal([]byte(cached), &price); err == nil {
			return &price, nil
		}
	}

	// Fallback to in-memory
	pm.pricesMu.RLock()
	defer pm.pricesMu.RUnlock()

	if price, ok := pm.prices[symbol]; ok {
		return price, nil
	}

	return nil, fmt.Errorf("price not found for symbol: %s", symbol)
}

// cachePrice stores price in Redis
func (pm *PriceManager) cachePrice(ctx context.Context, symbol string, price *pb.PriceUpdate) {
	data, err := json.Marshal(price)
	if err != nil {
		log.Printf("Failed to marshal price: %v", err)
		return
	}

	key := fmt.Sprintf("price:%s", symbol)
	if err := pm.rdb.Set(ctx, key, data, 10*time.Minute).Err(); err != nil {
		log.Printf("Failed to cache price: %v", err)
	}
}

// AddSymbol adds a new symbol to track
func (pm *PriceManager) AddSymbol(symbol string, basePrice float64) {
	pm.pricesMu.Lock()
	defer pm.pricesMu.Unlock()

	if _, exists := pm.prices[symbol]; !exists {
		pm.prices[symbol] = &pb.PriceUpdate{
			Symbol:       symbol,
			CurrentPrice: basePrice,
			Timestamp:    time.Now().Unix(),
		}
		log.Printf("➕ Added new symbol: %s at $%.2f", symbol, basePrice)
	}
}
