package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	pb "github.com/yourusername/realtime-portfolio-tracker/backend/pkg/pb"
)

type StockRepository struct {
	db *sql.DB
}

func NewStockRepository(db *sql.DB) *StockRepository {
	return &StockRepository{db: db}
}

func (r *StockRepository) AddStock(ctx context.Context, userID, symbol, name string, quantity, purchasePrice float64, purchaseDate int64) (*pb.Stock, error) {
	stockID := uuid.New().String()

	query := `
		INSERT INTO stocks (id, user_id, symbol, name, quantity, purchase_price, purchase_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, symbol, name, quantity, purchase_price, purchase_date
	`

	var stock pb.Stock
	err := r.db.QueryRowContext(ctx, query, stockID, userID, symbol, name, quantity, purchasePrice, purchaseDate).
		Scan(&stock.Id, &stock.Symbol, &stock.Name, &stock.Quantity, &stock.PurchasePrice, &stock.PurchaseDate)

	if err != nil {
		return nil, fmt.Errorf("failed to add stock: %w", err)
	}

	return &stock, nil
}

func (r *StockRepository) GetPortfolio(ctx context.Context, userID string) ([]*pb.Stock, error) {
	query := `
		SELECT id, symbol, name, quantity, purchase_price, purchase_date
		FROM stocks
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get portfolio: %w", err)
	}
	defer rows.Close()

	var stocks []*pb.Stock
	for rows.Next() {
		var stock pb.Stock
		err := rows.Scan(
			&stock.Id,
			&stock.Symbol,
			&stock.Name,
			&stock.Quantity,
			&stock.PurchasePrice,
			&stock.PurchaseDate,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan stock: %w", err)
		}
		stocks = append(stocks, &stock)
	}

	return stocks, nil
}

func (r *StockRepository) RemoveStock(ctx context.Context, userID, stockID string) error {
	query := `DELETE FROM stocks WHERE id = $1 AND user_id = $2`

	result, err := r.db.ExecContext(ctx, query, stockID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove stock: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get affected rows: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("stock not found or unauthorized")
	}

	return nil
}

func (r *StockRepository) GetSymbolsByUserID(ctx context.Context, userID string) ([]string, error) {
	query := `SELECT DISTINCT symbol FROM stocks WHERE user_id = $1`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get symbols: %w", err)
	}
	defer rows.Close()

	var symbols []string
	for rows.Next() {
		var symbol string
		if err := rows.Scan(&symbol); err != nil {
			return nil, fmt.Errorf("failed to scan symbol: %w", err)
		}
		symbols = append(symbols, symbol)
	}

	return symbols, nil
}
