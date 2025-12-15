-- Create users table (simplified for demo)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(255),
    quantity DECIMAL(18, 8) NOT NULL,
    purchase_price DECIMAL(18, 2) NOT NULL,
    purchase_date BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    target_price DECIMAL(18, 2) NOT NULL,
    condition VARCHAR(10) NOT NULL CHECK (condition IN ('ABOVE', 'BELOW')),
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_price DECIMAL(18, 2),
    triggered_at BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_user_symbol ON price_alerts(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_untriggered ON price_alerts(is_triggered) WHERE is_triggered = FALSE;

-- Insert demo user for testing
INSERT INTO users (id, username, email) 
VALUES ('demo-user-1', 'demo_user', 'demo@example.com')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample stocks for demo user
INSERT INTO stocks (id, user_id, symbol, name, quantity, purchase_price, purchase_date)
VALUES 
    ('stock-1', 'demo-user-1', 'AAPL', 'Apple Inc.', 10, 150.00, EXTRACT(EPOCH FROM NOW())::BIGINT),
    ('stock-2', 'demo-user-1', 'GOOGL', 'Alphabet Inc.', 5, 2800.00, EXTRACT(EPOCH FROM NOW())::BIGINT),
    ('stock-3', 'demo-user-1', 'MSFT', 'Microsoft Corporation', 8, 300.00, EXTRACT(EPOCH FROM NOW())::BIGINT)
ON CONFLICT (id) DO NOTHING;