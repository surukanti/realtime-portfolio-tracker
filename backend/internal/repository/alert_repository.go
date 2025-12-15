package repository

import (
	"context"
	"database/sql"
	"fmt"

	pb "github.com/chinnareddy578/realtime-portfolio-tracker/backend/pkg/pb"
	"github.com/google/uuid"
)

type AlertRepository struct {
	db *sql.DB
}

func NewAlertRepository(db *sql.DB) *AlertRepository {
	return &AlertRepository{db: db}
}

func (r *AlertRepository) CreateAlert(ctx context.Context, userID, symbol string, targetPrice float64, condition pb.AlertCondition) (string, error) {
	alertID := uuid.New().String()
	conditionStr := condition.String()

	query := `
		INSERT INTO price_alerts (id, user_id, symbol, target_price, condition, is_triggered)
		VALUES ($1, $2, $3, $4, $5, false)
	`

	_, err := r.db.ExecContext(ctx, query, alertID, userID, symbol, targetPrice, conditionStr)
	if err != nil {
		return "", fmt.Errorf("failed to create alert: %w", err)
	}

	return alertID, nil
}

func (r *AlertRepository) GetActiveAlerts(ctx context.Context, symbol string) ([]*pb.Alert, error) {
	query := `
		SELECT id, user_id, symbol, target_price, condition, created_at
		FROM price_alerts
		WHERE symbol = $1 AND is_triggered = false
	`

	rows, err := r.db.QueryContext(ctx, query, symbol)
	if err != nil {
		return nil, fmt.Errorf("failed to get alerts: %w", err)
	}
	defer rows.Close()

	var alerts []*pb.Alert
	for rows.Next() {
		var alert pb.Alert
		var conditionStr string
		var userID string

		err := rows.Scan(
			&alert.Id,
			&userID,
			&alert.Symbol,
			&alert.TargetPrice,
			&conditionStr,
			&alert.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan alert: %w", err)
		}

		// Convert condition string to enum
		if conditionStr == "ABOVE" {
			alert.Condition = pb.AlertCondition_ABOVE
		} else {
			alert.Condition = pb.AlertCondition_BELOW
		}

		alert.IsTriggered = false
		alerts = append(alerts, &alert)
	}

	return alerts, nil
}

func (r *AlertRepository) TriggerAlert(ctx context.Context, alertID string, triggeredPrice float64, triggeredAt int64) error {
	query := `
		UPDATE price_alerts
		SET is_triggered = true, triggered_price = $1, triggered_at = $2
		WHERE id = $3
	`

	_, err := r.db.ExecContext(ctx, query, triggeredPrice, triggeredAt, alertID)
	if err != nil {
		return fmt.Errorf("failed to trigger alert: %w", err)
	}

	return nil
}

func (r *AlertRepository) GetUserAlerts(ctx context.Context, userID string) ([]*pb.Alert, error) {
	query := `
		SELECT id, symbol, target_price, condition, is_triggered, 
		       triggered_price, triggered_at, created_at
		FROM price_alerts
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user alerts: %w", err)
	}
	defer rows.Close()

	var alerts []*pb.Alert
	for rows.Next() {
		var alert pb.Alert
		var conditionStr string
		var triggeredPrice sql.NullFloat64
		var triggeredAt sql.NullInt64

		err := rows.Scan(
			&alert.Id,
			&alert.Symbol,
			&alert.TargetPrice,
			&conditionStr,
			&alert.IsTriggered,
			&triggeredPrice,
			&triggeredAt,
			&alert.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan alert: %w", err)
		}

		if conditionStr == "ABOVE" {
			alert.Condition = pb.AlertCondition_ABOVE
		} else {
			alert.Condition = pb.AlertCondition_BELOW
		}

		if triggeredPrice.Valid {
			alert.TriggeredPrice = triggeredPrice.Float64
		}
		if triggeredAt.Valid {
			alert.TriggeredAt = triggeredAt.Int64
		}

		alerts = append(alerts, &alert)
	}

	return alerts, nil
}
