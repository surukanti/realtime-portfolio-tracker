package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"github.com/chinnareddy578/realtime-portfolio-tracker/backend/internal/repository"
	"github.com/chinnareddy578/realtime-portfolio-tracker/backend/internal/stream"
	pb "github.com/chinnareddy578/realtime-portfolio-tracker/backend/pkg/pb"
)

type PortfolioService struct {
	pb.UnimplementedPortfolioServiceServer
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

// AddStock - Unary RPC
func (s *PortfolioService) AddStock(ctx context.Context, req *pb.AddStockRequest) (*pb.AddStockResponse, error) {
	log.Printf("AddStock: %s for user %s", req.Symbol, req.UserId)

	stock, err := s.stockRepo.AddStock(
		ctx,
		req.UserId,
		req.Symbol,
		"", // Name can be fetched from API later
		req.Quantity,
		req.PurchasePrice,
		req.PurchaseDate,
	)

	if err != nil {
		return &pb.AddStockResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to add stock: %v", err),
		}, nil
	}

	// Ensure we're tracking this symbol
	s.priceManager.AddSymbol(req.Symbol, req.PurchasePrice)

	return &pb.AddStockResponse{
		Success: true,
		Message: "Stock added successfully",
		Stock:   stock,
	}, nil
}

// GetPortfolio - Unary RPC
func (s *PortfolioService) GetPortfolio(ctx context.Context, req *pb.GetPortfolioRequest) (*pb.GetPortfolioResponse, error) {
	log.Printf("GetPortfolio for user: %s", req.UserId)

	stocks, err := s.stockRepo.GetPortfolio(ctx, req.UserId)
	if err != nil {
		return nil, fmt.Errorf("failed to get portfolio: %w", err)
	}

	// Enrich with current prices
	var totalValue, totalGainLoss float64
	for _, stock := range stocks {
		currentPrice, err := s.priceManager.GetCurrentPrice(ctx, stock.Symbol)
		if err == nil {
			stock.CurrentPrice = currentPrice.CurrentPrice
			stock.GainLoss = (currentPrice.CurrentPrice - stock.PurchasePrice) * stock.Quantity
			if stock.PurchasePrice > 0 {
				stock.GainLossPercentage = ((currentPrice.CurrentPrice - stock.PurchasePrice) / stock.PurchasePrice) * 100
			}
			totalValue += currentPrice.CurrentPrice * stock.Quantity
			totalGainLoss += stock.GainLoss
		}
	}

	totalInvestment := totalValue - totalGainLoss
	var totalGainLossPercentage float64
	if totalInvestment > 0 {
		totalGainLossPercentage = (totalGainLoss / totalInvestment) * 100
	}

	return &pb.GetPortfolioResponse{
		Stocks:                  stocks,
		TotalValue:              totalValue,
		TotalGainLoss:           totalGainLoss,
		TotalGainLossPercentage: totalGainLossPercentage,
	}, nil
}

// SetPriceAlert - Unary RPC
func (s *PortfolioService) SetPriceAlert(ctx context.Context, req *pb.SetPriceAlertRequest) (*pb.SetPriceAlertResponse, error) {
	log.Printf("SetPriceAlert: %s at $%.2f (%s) for user %s",
		req.Symbol, req.TargetPrice, req.Condition, req.UserId)

	alertID, err := s.alertRepo.CreateAlert(ctx, req.UserId, req.Symbol, req.TargetPrice, req.Condition)
	if err != nil {
		return &pb.SetPriceAlertResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to set alert: %v", err),
		}, nil
	}

	return &pb.SetPriceAlertResponse{
		Success: true,
		Message: "Alert set successfully",
		AlertId: alertID,
	}, nil
}

// StreamPrices - Server Streaming RPC
func (s *PortfolioService) StreamPrices(req *pb.StreamPricesRequest, stream pb.PortfolioService_StreamPricesServer) error {
	log.Printf("StreamPrices started for user %s with %d symbols", req.UserId, len(req.Symbols))

	// Subscribe to all requested symbols
	channels := make(map[string]chan *pb.PriceUpdate)
	for _, symbol := range req.Symbols {
		channels[symbol] = s.priceManager.Subscribe(symbol)
	}

	// Clean up on exit
	defer func() {
		for symbol, ch := range channels {
			s.priceManager.Unsubscribe(symbol, ch)
		}
	}()

	// Stream prices to client
	for {
		select {
		case <-stream.Context().Done():
			log.Printf("StreamPrices ended for user %s", req.UserId)
			return nil
		default:
			// Listen to all symbol channels
			for symbol, ch := range channels {
				select {
				case update, ok := <-ch:
					if !ok {
						log.Printf("Channel closed for %s", symbol)
						return nil
					}
					if err := stream.Send(update); err != nil {
						log.Printf("Error sending update: %v", err)
						return err
					}
				default:
					// Non-blocking check
				}
			}
			time.Sleep(100 * time.Millisecond)
		}
	}
}

// LivePortfolio - Bidirectional Streaming RPC
func (s *PortfolioService) LivePortfolio(stream pb.PortfolioService_LivePortfolioServer) error {
	log.Println("LivePortfolio stream started")

	// Channel for price updates
	updates := make(chan *pb.PortfolioUpdate, 100)
	done := make(chan bool)

	// Goroutine to handle incoming client messages
	go func() {
		for {
			action, err := stream.Recv()
			if err == io.EOF {
				done <- true
				return
			}
			if err != nil {
				log.Printf("Error receiving action: %v", err)
				done <- true
				return
			}

			log.Printf("Received action: %v for symbol: %s", action.Action, action.Symbol)

			// Handle different action types
			switch action.Action {
			case pb.PortfolioAction_SUBSCRIBE:
				// Subscribe to symbol updates
				ch := s.priceManager.Subscribe(action.Symbol)
				go func(symbol string, ch chan *pb.PriceUpdate) {
					for update := range ch {
						updates <- &pb.PortfolioUpdate{
							Type:        pb.PortfolioUpdate_PRICE_CHANGE,
							PriceUpdate: update,
							Timestamp:   time.Now().Unix(),
						}
					}
				}(action.Symbol, ch)

			case pb.PortfolioAction_ADD_STOCK:
				if action.AddDetails != nil {
					_, err := s.stockRepo.AddStock(
						stream.Context(),
						action.UserId,
						action.Symbol,
						"",
						action.AddDetails.Quantity,
						action.AddDetails.PurchasePrice,
						action.AddDetails.PurchaseDate,
					)
					if err != nil {
						log.Printf("Error adding stock: %v", err)
					}
				}
			}
		}
	}()

	// Send updates to client
	for {
		select {
		case <-done:
			log.Println("LivePortfolio stream ended")
			return nil
		case update := <-updates:
			if err := stream.Send(update); err != nil {
				log.Printf("Error sending update: %v", err)
				return err
			}
		}
	}
}

// RemoveStock - Unary RPC
func (s *PortfolioService) RemoveStock(ctx context.Context, req *pb.RemoveStockRequest) (*pb.RemoveStockResponse, error) {
	log.Printf("RemoveStock: %s for user %s", req.StockId, req.UserId)

	err := s.stockRepo.RemoveStock(ctx, req.UserId, req.StockId)
	if err != nil {
		return &pb.RemoveStockResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to remove stock: %v", err),
		}, nil
	}

	return &pb.RemoveStockResponse{
		Success: true,
		Message: "Stock removed successfully",
	}, nil
}

// GetHistoricalData - Unary RPC (simplified for demo)
func (s *PortfolioService) GetHistoricalData(ctx context.Context, req *pb.HistoricalDataRequest) (*pb.HistoricalDataResponse, error) {
	log.Printf("GetHistoricalData for %s", req.Symbol)

	// For demo, generate sample historical data
	// In production, fetch from Alpha Vantage or similar API
	var prices []*pb.HistoricalPrice
	basePrice := 150.0
	now := time.Now()

	for i := 30; i >= 0; i-- {
		date := now.AddDate(0, 0, -i)
		prices = append(prices, &pb.HistoricalPrice{
			Timestamp: date.Unix(),
			Open:      basePrice + float64(i)*0.5,
			High:      basePrice + float64(i)*0.8,
			Low:       basePrice + float64(i)*0.3,
			Close:     basePrice + float64(i)*0.6,
			Volume:    1000000 + float64(i)*10000,
		})
	}

	return &pb.HistoricalDataResponse{
		Symbol: req.Symbol,
		Prices: prices,
	}, nil
}
