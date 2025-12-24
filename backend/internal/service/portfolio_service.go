package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"time"

	"github.com/chinnareddy578/realtime-portfolio-tracker/backend/internal/repository"
	"github.com/chinnareddy578/realtime-portfolio-tracker/backend/internal/stream"
)

// Simple structs for HTTP API
type Stock struct {
	ID              string
	Symbol          string
	Name            string
	Quantity        float64
	PurchasePrice   float64
	CurrentPrice    float64
	GainLoss        float64
	GainLossPercent float64
}

type GetPortfolioResponse struct {
	Stocks        []*Stock
	TotalValue    float64
	TotalGainLoss float64
}

type AddStockResponse struct {
	Success bool
	Message string
	Stock   *Stock
}

type SetPriceAlertResponse struct {
	Success bool
	Message string
	AlertId string
}

type GetAlertsResponse struct {
	Alerts []*repository.Alert
}

type PortfolioService struct {
	stockRepo    *repository.StockRepository
	alertRepo    *repository.AlertRepository
	priceManager *stream.PriceManager
}

func NewPortfolioService(
	stockRepo *repository.StockRepository,
	alertRepo *repository.AlertRepository,
	priceManager *stream.PriceManager,
) *PortfolioService {
	return &PortfolioService{
		stockRepo:    stockRepo,
		alertRepo:    alertRepo,
		priceManager: priceManager,
	}
}

// HTTP Handlers for REST API

func (s *PortfolioService) GetPortfolioHTTP(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		userID = "demo-user-1" // Default for demo
	}

	// Mock implementation for now
	response := &GetPortfolioResponse{
		Stocks: []*Stock{
			{
				ID:              "stock-1",
				Symbol:          "AAPL",
				Name:            "Apple Inc.",
				Quantity:        10,
				PurchasePrice:   150.00,
				CurrentPrice:    175.50,
				GainLoss:        255.00,
				GainLossPercent: 17.00,
			},
			{
				ID:              "stock-2",
				Symbol:          "GOOGL",
				Name:            "Alphabet Inc.",
				Quantity:        5,
				PurchasePrice:   2800.00,
				CurrentPrice:    2950.00,
				GainLoss:        750.00,
				GainLossPercent: 5.36,
			},
			{
				ID:              "stock-3",
				Symbol:          "MSFT",
				Name:            "Microsoft Corporation",
				Quantity:        8,
				PurchasePrice:   300.00,
				CurrentPrice:    415.26,
				GainLoss:        921.08,
				GainLossPercent: 38.39,
			},
			{
				ID:              "stock-4",
				Symbol:          "TSLA",
				Name:            "Tesla Inc.",
				Quantity:        15,
				PurchasePrice:   200.00,
				CurrentPrice:    248.42,
				GainLoss:        726.30,
				GainLossPercent: 24.21,
			},
			{
				ID:              "stock-5",
				Symbol:          "JPM",
				Name:            "JPMorgan Chase & Co.",
				Quantity:        12,
				PurchasePrice:   180.00,
				CurrentPrice:    198.35,
				GainLoss:        220.20,
				GainLossPercent: 10.18,
			},
			{
				ID:              "stock-6",
				Symbol:          "JNJ",
				Name:            "Johnson & Johnson",
				Quantity:        20,
				PurchasePrice:   140.00,
				CurrentPrice:    155.67,
				GainLoss:        313.40,
				GainLossPercent: 11.19,
			},
			{
				ID:              "stock-7",
				Symbol:          "AMZN",
				Name:            "Amazon.com Inc.",
				Quantity:        25,
				PurchasePrice:   3200.00,
				CurrentPrice:    3442.13,
				GainLoss:        6053.25,
				GainLossPercent: 7.54,
			},
			{
				ID:              "stock-8",
				Symbol:          "NVDA",
				Name:            "NVIDIA Corporation",
				Quantity:        30,
				PurchasePrice:   450.00,
				CurrentPrice:    875.28,
				GainLoss:        12758.40,
				GainLossPercent: 94.48,
			},
			{
				ID:              "stock-9",
				Symbol:          "META",
				Name:            "Meta Platforms Inc.",
				Quantity:        18,
				PurchasePrice:   330.00,
				CurrentPrice:    484.16,
				GainLoss:        2786.88,
				GainLossPercent: 46.87,
			},
			{
				ID:              "stock-10",
				Symbol:          "NFLX",
				Name:            "Netflix Inc.",
				Quantity:        22,
				PurchasePrice:   380.00,
				CurrentPrice:    612.09,
				GainLoss:        5129.98,
				GainLossPercent: 61.11,
			},
			{
				ID:              "stock-11",
				Symbol:          "V",
				Name:            "Visa Inc.",
				Quantity:        40,
				PurchasePrice:   220.00,
				CurrentPrice:    265.47,
				GainLoss:        1818.80,
				GainLossPercent: 20.68,
			},
			{
				ID:              "stock-12",
				Symbol:          "WMT",
				Name:            "Walmart Inc.",
				Quantity:        35,
				PurchasePrice:   140.00,
				CurrentPrice:    153.78,
				GainLoss:        482.30,
				GainLossPercent: 9.99,
			},
		},
		TotalValue:    125847.15,
		TotalGainLoss: 27714.59,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *PortfolioService) AddStockHTTP(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID        string  `json:"user_id"`
		Symbol        string  `json:"symbol"`
		Quantity      float64 `json:"quantity"`
		PurchasePrice float64 `json:"purchase_price"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	response := &AddStockResponse{
		Success: true,
		Message: "Stock added successfully",
		Stock: &Stock{
			ID:              "new-stock-id",
			Symbol:          req.Symbol,
			Name:            req.Symbol + " Corp.",
			Quantity:        req.Quantity,
			PurchasePrice:   req.PurchasePrice,
			CurrentPrice:    req.PurchasePrice * 1.05,
			GainLoss:        req.PurchasePrice * req.Quantity * 0.05,
			GainLossPercent: 5.00,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *PortfolioService) GetAlertsHTTP(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		userID = "demo-user-1" // Default for demo
	}

	response := &GetAlertsResponse{}

	// Try to get real alerts from database, fallback to mock data
	if s.alertRepo != nil {
		alerts, err := s.alertRepo.GetUserAlerts(context.Background(), userID)
		if err == nil {
			response.Alerts = alerts
		} else {
			// Fallback to mock data
			response.Alerts = []*repository.Alert{
				{
					ID:          "1",
					Symbol:      "AAPL",
					TargetPrice: 180.00,
					Condition:   0,
					IsTriggered: false,
					CreatedAt:   1640995200,
				},
				{
					ID:          "2",
					Symbol:      "GOOGL",
					TargetPrice: 2900.00,
					Condition:   1,
					IsTriggered: true,
					CreatedAt:   1641081600,
				},
			}
		}
	} else {
		// Mock data when no database connection
		response.Alerts = []*repository.Alert{
			{
				ID:          "1",
				Symbol:      "AAPL",
				TargetPrice: 180.00,
				Condition:   0,
				IsTriggered: false,
				CreatedAt:   1640995200,
			},
			{
				ID:          "2",
				Symbol:      "GOOGL",
				TargetPrice: 2900.00,
				Condition:   1,
				IsTriggered: true,
				CreatedAt:   1641081600,
			},
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *PortfolioService) SetAlertHTTP(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID      string  `json:"user_id"`
		Symbol      string  `json:"symbol"`
		TargetPrice float64 `json:"target_price"`
		Condition   int     `json:"condition"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	response := &SetPriceAlertResponse{
		Success: false,
		Message: "Failed to set alert",
	}

	// Try to create alert in database if repository is available
	if s.alertRepo != nil {
		condition := repository.AlertCondition_ABOVE
		if req.Condition == 1 {
			condition = repository.AlertCondition_BELOW
		}

		alertID, err := s.alertRepo.CreateAlert(context.Background(), req.UserID, req.Symbol, req.TargetPrice, condition)
		if err != nil {
			log.Printf("Failed to create alert: %v", err)
			response.Message = "Database error: " + err.Error()
		} else {
			response.Success = true
			response.Message = "Alert set successfully"
			response.AlertId = alertID
		}
	} else {
		// Fallback to mock response when no database
		response.Success = true
		response.Message = "Alert set successfully (mock mode)"
		response.AlertId = "mock-alert-" + fmt.Sprintf("%d", time.Now().Unix())
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *PortfolioService) GetChartDataHTTP(w http.ResponseWriter, r *http.Request) {
	symbol := r.URL.Query().Get("symbol")
	if symbol == "" {
		symbol = "AAPL" // Default symbol
	}

	// Generate mock chart data with technical indicators
	data := generateMockChartData(symbol, 0, 0)
	sma := generateSMAIndicator(data, 20)
	rsi := generateRSIIndicator(data, 14)
	macd := generateMACDIndicator(data)

	response := map[string]interface{}{
		"symbol":       symbol,
		"candlesticks": data,
		"indicators": map[string]interface{}{
			"sma":  sma["points"],
			"rsi":  rsi["points"],
			"macd": macd["points"],
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Helper functions for chart data generation

func generateMockChartData(symbol string, startTime, endTime int64) []map[string]interface{} {
	var candlesticks []map[string]interface{}

	// Generate data for the last 100 days if no time range specified
	if startTime == 0 {
		startTime = time.Now().AddDate(0, 0, -100).Unix()
	}
	if endTime == 0 {
		endTime = time.Now().Unix()
	}

	basePrice := 150.0
	currentPrice := basePrice

	// Generate daily candlesticks
	for timestamp := startTime; timestamp <= endTime; timestamp += 86400 {
		change := (rand.Float64() - 0.5) * 20
		open := currentPrice
		close := currentPrice + change
		high := math.Max(open, close) + rand.Float64()*10
		low := math.Min(open, close) - rand.Float64()*10
		volume := rand.Float64()*1000000 + 500000

		candlestick := map[string]interface{}{
			"time":   timestamp,
			"open":   math.Round(open*100) / 100,
			"high":   math.Round(high*100) / 100,
			"low":    math.Round(low*100) / 100,
			"close":  math.Round(close*100) / 100,
			"volume": math.Round(volume),
		}

		candlesticks = append(candlesticks, candlestick)
		currentPrice = close
	}

	return candlesticks
}

func generateSMAIndicator(candlesticks []map[string]interface{}, period int) map[string]interface{} {
	var points []map[string]interface{}

	for i := period - 1; i < len(candlesticks); i++ {
		sum := 0.0
		for j := i - period + 1; j <= i; j++ {
			sum += candlesticks[j]["close"].(float64)
		}
		avg := sum / float64(period)

		point := map[string]interface{}{
			"time":  candlesticks[i]["time"],
			"value": math.Round(avg*100) / 100,
		}
		points = append(points, point)
	}

	return map[string]interface{}{
		"name":   "SMA",
		"points": points,
	}
}

func generateRSIIndicator(candlesticks []map[string]interface{}, period int) map[string]interface{} {
	var points []map[string]interface{}

	if len(candlesticks) < period+1 {
		return map[string]interface{}{
			"name":   "RSI",
			"points": points,
		}
	}

	// Calculate price changes
	var gains, losses []float64
	for i := 1; i < len(candlesticks); i++ {
		change := candlesticks[i]["close"].(float64) - candlesticks[i-1]["close"].(float64)
		if change > 0 {
			gains = append(gains, change)
			losses = append(losses, 0)
		} else {
			gains = append(gains, 0)
			losses = append(losses, -change)
		}
	}

	// Calculate initial averages
	avgGain := 0.0
	avgLoss := 0.0
	for i := 0; i < period; i++ {
		avgGain += gains[i]
		avgLoss += losses[i]
	}
	avgGain /= float64(period)
	avgLoss /= float64(period)

	// Calculate RSI values
	for i := period; i < len(candlesticks); i++ {
		if i > period {
			avgGain = (avgGain*float64(period-1) + gains[i-1]) / float64(period)
			avgLoss = (avgLoss*float64(period-1) + losses[i-1]) / float64(period)
		}

		rs := avgGain / avgLoss
		rsi := 100 - (100 / (1 + rs))

		point := map[string]interface{}{
			"time":  candlesticks[i]["time"],
			"value": math.Round(rsi*100) / 100,
		}
		points = append(points, point)
	}

	return map[string]interface{}{
		"name":   "RSI",
		"points": points,
	}
}

func generateMACDIndicator(candlesticks []map[string]interface{}) map[string]interface{} {
	var points []map[string]interface{}

	if len(candlesticks) < 26 {
		return map[string]interface{}{
			"name":   "MACD",
			"points": points,
		}
	}

	// Calculate EMA12 and EMA26
	ema12 := calculateEMA(candlesticks, 12)
	ema26 := calculateEMA(candlesticks, 26)

	// Calculate MACD line
	startIdx := 25 // Max of the two periods - 1
	for i := startIdx; i < len(candlesticks); i++ {
		if i < len(ema12) && i < len(ema26) {
			macd := ema12[i] - ema26[i]

			point := map[string]interface{}{
				"time":  candlesticks[i]["time"],
				"value": math.Round(macd*100) / 100,
			}
			points = append(points, point)
		}
	}

	return map[string]interface{}{
		"name":   "MACD",
		"points": points,
	}
}

func calculateEMA(candlesticks []map[string]interface{}, period int) []float64 {
	var ema []float64
	multiplier := 2.0 / (float64(period) + 1.0)

	// Calculate initial SMA
	sum := 0.0
	for i := 0; i < period; i++ {
		sum += candlesticks[i]["close"].(float64)
	}
	currentEMA := sum / float64(period)
	ema = append(ema, currentEMA)

	// Calculate subsequent EMA values
	for i := period; i < len(candlesticks); i++ {
		currentEMA = (candlesticks[i]["close"].(float64) * multiplier) + (currentEMA * (1 - multiplier))
		ema = append(ema, currentEMA)
	}

	return ema
}
