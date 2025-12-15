import React, { useState, useEffect } from 'react';
import { PortfolioServiceClient } from './proto/PortfolioServiceClientPb';
import * as messages from './proto/portfolio_pb';
import './App.css';

// Initialize gRPC-Web client
const client = new PortfolioServiceClient('http://localhost:8081', null, null);

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [priceUpdates, setPriceUpdates] = useState({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    quantity: '',
    price: ''
  });
  const [totalValue, setTotalValue] = useState(0);
  const [totalGainLoss, setTotalGainLoss] = useState(0);

  const userId = 'demo-user-1';

  // Fetch portfolio on mount
  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Fetch portfolio data
  const fetchPortfolio = () => {
    const request = new messages.GetPortfolioRequest();
    request.setUserId(userId);

    client.getPortfolio(request, {}, (err, response) => {
      if (err) {
        console.error('Error fetching portfolio:', err);
        return;
      }

      const stocks = response.getStocksList();
      setPortfolio(stocks);
      setTotalValue(response.getTotalValue());
      setTotalGainLoss(response.getTotalGainLoss());
    });
  };

  // Start streaming prices
  const startStreaming = () => {
    if (portfolio.length === 0) {
      alert('Add some stocks first!');
      return;
    }

    const request = new messages.StreamPricesRequest();
    request.setUserId(userId);
    
    // Get unique symbols from portfolio
    const symbols = [...new Set(portfolio.map(stock => stock.getSymbol()))];
    request.setSymbolsList(symbols);

    const stream = client.streamPrices(request, {});
    setIsStreaming(true);

    stream.on('data', (update) => {
      const symbol = update.getSymbol();
      setPriceUpdates(prev => ({
        ...prev,
        [symbol]: {
          price: update.getCurrentPrice(),
          change: update.getChange(),
          changePercent: update.getChangePercentage(),
          timestamp: update.getTimestamp()
        }
      }));
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      setIsStreaming(false);
    });

    stream.on('end', () => {
      console.log('Stream ended');
      setIsStreaming(false);
    });
  };

  // Add new stock
  const addStock = () => {
    if (!newStock.symbol || !newStock.quantity || !newStock.price) {
      alert('Please fill all fields');
      return;
    }

    const request = new messages.AddStockRequest();
    request.setUserId(userId);
    request.setSymbol(newStock.symbol.toUpperCase());
    request.setQuantity(parseFloat(newStock.quantity));
    request.setPurchasePrice(parseFloat(newStock.price));
    request.setPurchaseDate(Math.floor(Date.now() / 1000));

    client.addStock(request, {}, (err, response) => {
      if (err) {
        console.error('Error adding stock:', err);
        return;
      }

      if (response.getSuccess()) {
        alert('Stock added successfully!');
        setNewStock({ symbol: '', quantity: '', price: '' });
        fetchPortfolio();
      } else {
        alert('Failed to add stock: ' + response.getMessage());
      }
    });
  };

  // Remove stock
  const removeStock = (stockId) => {
    const request = new messages.RemoveStockRequest();
    request.setUserId(userId);
    request.setStockId(stockId);

    client.removeStock(request, {}, (err, response) => {
      if (err) {
        console.error('Error removing stock:', err);
        return;
      }

      if (response.getSuccess()) {
        alert('Stock removed successfully!');
        fetchPortfolio();
      }
    });
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📈 Real-Time Portfolio Tracker</h1>
        <p className="subtitle">Powered by gRPC & Protocol Buffers</p>
      </header>

      <div className="container">
        {/* Add Stock Form */}
        <div className="card">
          <h2>Add New Stock</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Symbol (e.g., AAPL)"
              value={newStock.symbol}
              onChange={(e) => setNewStock({...newStock, symbol: e.target.value})}
              className="input"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newStock.quantity}
              onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
              className="input"
            />
            <input
              type="number"
              placeholder="Purchase Price"
              value={newStock.price}
              onChange={(e) => setNewStock({...newStock, price: e.target.value})}
              className="input"
            />
            <button onClick={addStock} className="btn btn-primary">
              Add Stock
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="card">
          <h2>Portfolio Summary</h2>
          <div className="summary">
            <div className="summary-item">
              <span className="label">Total Value:</span>
              <span className="value">${totalValue.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Total Gain/Loss:</span>
              <span className={`value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
              </span>
            </div>
          </div>
          <button 
            onClick={startStreaming} 
            disabled={isStreaming}
            className="btn btn-success"
          >
            {isStreaming ? '🔴 Streaming Live...' : '▶️ Start Price Stream'}
          </button>
        </div>

        {/* Portfolio Holdings */}
        <div className="card">
          <h2>Your Holdings</h2>
          {portfolio.length === 0 ? (
            <p className="empty-state">No stocks in portfolio. Add some to get started!</p>
          ) : (
            <div className="stocks-grid">
              {portfolio.map((stock) => {
                const symbol = stock.getSymbol();
                const livePrice = priceUpdates[symbol];
                const currentPrice = livePrice ? livePrice.price : stock.getCurrentPrice();
                const gainLoss = (currentPrice - stock.getPurchasePrice()) * stock.getQuantity();
                const gainLossPercent = ((currentPrice - stock.getPurchasePrice()) / stock.getPurchasePrice()) * 100;

                return (
                  <div key={stock.getId()} className="stock-card">
                    <div className="stock-header">
                      <h3>{symbol}</h3>
                      {livePrice && (
                        <span className="live-indicator">🔴 LIVE</span>
                      )}
                    </div>
                    <div className="stock-details">
                      <div className="detail-row">
                        <span>Quantity:</span>
                        <span>{stock.getQuantity()}</span>
                      </div>
                      <div className="detail-row">
                        <span>Purchase Price:</span>
                        <span>${stock.getPurchasePrice().toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Current Price:</span>
                        <span className={livePrice ? 'price-live' : ''}>
                          ${currentPrice.toFixed(2)}
                        </span>
                      </div>
                      {livePrice && (
                        <div className="detail-row">
                          <span>Change:</span>
                          <span className={livePrice.change >= 0 ? 'positive' : 'negative'}>
                            {livePrice.change >= 0 ? '+' : ''}${livePrice.change.toFixed(2)} 
                            ({livePrice.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span>Total Gain/Loss:</span>
                        <span className={gainLoss >= 0 ? 'positive' : 'negative'}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}
                          ({gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeStock(stock.getId())}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;