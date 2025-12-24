package repository

import (
	"context"
	"database/sql"
	"fmt"

	// pb "github.com/chinnareddy578/realtime-portfolio-tracker/backend/pkg/pb"
	"github.com/google/uuid"
)

// Simple alert struct to replace protobuf
type Alert struct {
	ID             string
	Symbol         string
	TargetPrice    float64
	Condition      int32 // 0 = ABOVE, 1 = BELOW
	IsTriggered    bool
	TriggeredPrice *float64
	TriggeredAt    *int64
	CreatedAt      int64
}

type AlertCondition int32

const (
	AlertCondition_ABOVE AlertCondition = 0
	AlertCondition_BELOW AlertCondition = 1
)

type AlertRepository struct {
	db *sql.DB
}

func NewAlertRepository(db *sql.DB) *AlertRepository {
	return &AlertRepository{db: db}
}

func (r *AlertRepository) CreateAlert(ctx context.Context, userID, symbol string, targetPrice float64, condition AlertCondition) (string, error) {
	alertID := uuid.New().String()
	var conditionStr string
	if condition == AlertCondition_ABOVE {
		conditionStr = "ABOVE"
	} else {
		conditionStr = "BELOW"
	}

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

func (r *AlertRepository) GetActiveAlerts(ctx context.Context, symbol string) ([]*Alert, error) {
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

	var alerts []*Alert
	for rows.Next() {
		var alert Alert
		var conditionStr string
		var userID string

		err := rows.Scan(
			&alert.ID,
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
			alert.Condition = int32(AlertCondition_ABOVE)
		} else {
			alert.Condition = int32(AlertCondition_BELOW)
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

func (r *AlertRepository) GetUserAlerts(ctx context.Context, userID string) ([]*Alert, error) {
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

	var alerts []*Alert
	for rows.Next() {
		var alert Alert
		var conditionStr string
		var triggeredPrice sql.NullFloat64
		var triggeredAt sql.NullInt64

		err := rows.Scan(
			&alert.ID,
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
			alert.Condition = int32(AlertCondition_ABOVE)
		} else {
			alert.Condition = int32(AlertCondition_BELOW)
		}

		if triggeredPrice.Valid {
			alert.TriggeredPrice = &triggeredPrice.Float64
		}
		if triggeredAt.Valid {
			alert.TriggeredAt = &triggeredAt.Int64
		}

		alerts = append(alerts, &alert)
	}

	return alerts, nil
}
