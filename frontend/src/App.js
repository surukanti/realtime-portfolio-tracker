import React, { useState, useEffect, useCallback, useRef } from 'react';
// Temporarily disable gRPC imports until proto files are regenerated
// import { PortfolioServiceClient } from './proto/portfolio_grpc_web_pb';
// import * as messages from './proto/portfolio_pb';
import { createChart, ColorType } from 'lightweight-charts';
import './App.css';

// Charts Component
function ChartsComponent() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [indicatorValues, setIndicatorValues] = useState({
    sma: '--',
    rsi: '--',
    macd: '--',
    volume: '--',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  const calculateSMA = useCallback((data, period) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j].close;
      }
      const avg = sum / period;
      sma.push({
        time: data[i].time,
        value: Math.round(avg * 100) / 100,
      });
    }
    return sma;
  }, []);

  const calculateRSI = useCallback((data, period) => {
    if (data.length < period + 1) return [];

    const rsi = [];
    const gains = [];
    const losses = [];

    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    // Calculate initial averages
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calculate RSI values
    for (let i = period; i < data.length; i++) {
      if (i > period) {
        avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
      }

      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));

      rsi.push({
        time: data[i].time,
        value: Math.round(rsiValue * 100) / 100,
      });
    }

    return rsi;
  }, []);

  const calculateEMA = useCallback((data, period) => {
    const ema = [];
    const multiplier = 2 / (period + 1);

    // Calculate initial SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }
    let currentEMA = sum / period;
    ema.push(currentEMA);

    // Calculate subsequent EMA values
    for (let i = period; i < data.length; i++) {
      currentEMA = (data[i].close * multiplier) + (currentEMA * (1 - multiplier));
      ema.push(currentEMA);
    }

    return ema;
  }, []);

  const calculateMACD = useCallback((data) => {
    if (data.length < 26) return [];

    const macd = [];
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);

    const startIdx = 25;
    for (let i = startIdx; i < data.length; i++) {
      if (i < ema12.length && i < ema26.length) {
        const macdValue = ema12[i] - ema26[i];
        macd.push({
          time: data[i].time,
          value: Math.round(macdValue * 100) / 100,
        });
      }
    }

    return macd;
  }, [calculateEMA]);

  const addTechnicalIndicators = useCallback((chart, data) => {
    // Calculate and add SMA (20)
    const smaData = calculateSMA(data, 20);
    if (smaData.length > 0) {
      const smaSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        title: 'SMA (20)',
      });
      smaSeries.setData(smaData);
    }

    // Calculate and add RSI (14)
    const rsiData = calculateRSI(data, 14);
    if (rsiData.length > 0) {
      const rsiSeries = chart.addLineSeries({
        color: '#FF9800',
        lineWidth: 2,
        title: 'RSI (14)',
        priceScaleId: 'rsi',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });
      rsiSeries.setData(rsiData);
    }

    // Calculate and add MACD
    const macdData = calculateMACD(data);
    if (macdData.length > 0) {
      const macdSeries = chart.addLineSeries({
        color: '#9C27B0',
        lineWidth: 2,
        title: 'MACD',
      });
      macdSeries.setData(macdData);
    }
  }, [calculateSMA, calculateRSI, calculateMACD]);

  const loadChartData = useCallback(async (symbol) => {
    console.log('Loading chart data for symbol:', symbol);
    setIsLoading(true);
    try {
      // Fetch chart data from backend
      const response = await fetch(`http://localhost:8080/api/charts?symbol=${symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const chartData = await response.json();
      console.log('Received chart data:', chartData);
      setChartData(chartData);
      setIsLoading(false);

    } catch (error) {
      console.error('Error loading chart data:', error);
      // Fallback to mock data if backend is not available
      const data = generateMockChartData();
      const sma = calculateSMA(data, 20);
      const rsi = calculateRSI(data, 14);
      const macd = calculateMACD(data);

      // Create mock chart data structure
      const mockChartData = {
        symbol: selectedSymbol,
        candlesticks: data,
        indicators: {
          sma: sma,
          rsi: rsi,
          macd: macd
        }
      };

      setChartData(mockChartData);
      setIsLoading(false);
    }
  }, [addTechnicalIndicators, calculateMACD, calculateSMA, calculateRSI]);

  useEffect(() => {
    if (chartContainerRef.current && !chartRef.current && !isLoading && chartData) {
      console.log('Creating chart...');
      // Create the chart
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#333',
        },
        width: chartContainerRef.current.clientWidth || 800,
        height: 400,
        grid: {
          vertLines: { color: '#e0e0e0' },
          horzLines: { color: '#e0e0e0' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#cccccc',
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;
      console.log('Chart created successfully');
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [isLoading, chartData]);

  // Populate chart with data when both are ready
  useEffect(() => {
    if (chartRef.current && chartData && !isLoading) {
      console.log('Populating chart with data...');

      // Try the direct chart API first (this should work in v5)
      console.log('Trying direct chart API...');

      // In v4.x, use addCandlestickSeries() method
      console.log('Using v4.x API with addCandlestickSeries...');

      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Transform data for lightweight-charts
      const candlestickData = chartData.candlesticks.map(item => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));

      // Update indicator values for display
      const smaPoints = chartData.indicators?.sma || [];
      const rsiPoints = chartData.indicators?.rsi || [];
      const macdPoints = chartData.indicators?.macd || [];

      setIndicatorValues({
        sma: smaPoints.length > 0 ? smaPoints[smaPoints.length - 1].value.toFixed(2) : '--',
        rsi: rsiPoints.length > 0 ? rsiPoints[rsiPoints.length - 1].value.toFixed(2) : '--',
        macd: macdPoints.length > 0 ? macdPoints[macdPoints.length - 1].value.toFixed(2) : '--',
        volume: candlestickData.length > 0 ? candlestickData[candlestickData.length - 1].volume.toLocaleString() : '--',
      });

      // Clear existing series safely
      try {
        // Get all series and remove them
        const seriesToRemove = [];
        if (chartRef.current._series) {
          chartRef.current._series.forEach(series => {
            seriesToRemove.push(series);
          });
          seriesToRemove.forEach(series => {
            try {
              chartRef.current.removeSeries(series);
            } catch (e) {
              console.warn('Error removing series:', e);
            }
          });
        }
      } catch (error) {
        console.warn('Error clearing chart series:', error);
      }

        // Add volume histogram
        const volumeSeries = chartRef.current.addHistogramSeries({
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
          scaleMargins: {
            top: 0.7,
            bottom: 0,
          },
        });

        volumeSeries.setData(candlestickData.map(item => ({
          time: item.time,
          value: item.volume,
          color: item.close > item.open ? '#26a69a' : '#ef5350',
        })));

        // Add technical indicators from backend data
        if (smaPoints.length > 0) {
          const smaSeries = chartRef.current.addLineSeries({
            color: '#2196F3',
            lineWidth: 2,
            title: 'SMA (20)',
          });
          smaSeries.setData(smaPoints);
        }

        if (rsiPoints.length > 0) {
          const rsiSeries = chartRef.current.addLineSeries({
            color: '#FF9800',
            lineWidth: 2,
            title: 'RSI (14)',
            priceScaleId: 'rsi',
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
          });
          rsiSeries.setData(rsiPoints);
        }

        if (macdPoints.length > 0) {
          const macdSeries = chartRef.current.addLineSeries({
            color: '#9C27B0',
            lineWidth: 2,
            title: 'MACD',
          });
          macdSeries.setData(macdPoints);
        }

    }
  }, [chartData, isLoading]);

  useEffect(() => {
    // Load chart data for the selected symbol
    loadChartData(selectedSymbol);
  }, [selectedSymbol, loadChartData]);

  const generateMockChartData = () => {
    const data = [];
    const basePrice = 150;
    let currentPrice = basePrice;

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 10;
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      const volume = Math.random() * 1000000 + 500000;

      data.push({
        time: Date.now() / 1000 - (100 - i) * 86400, // Daily data
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.round(volume),
      });

      currentPrice = close;
    }

    return data;
  };


  return (
    <div className="charts-container">
      <div className="chart-controls">
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="symbol-select"
        >
          <option value="AAPL">AAPL - Apple Inc.</option>
          <option value="GOOGL">GOOGL - Alphabet Inc.</option>
          <option value="MSFT">MSFT - Microsoft</option>
          <option value="AMZN">AMZN - Amazon</option>
          <option value="TSLA">TSLA - Tesla</option>
          <option value="NVDA">NVDA - NVIDIA Corporation</option>
          <option value="META">META - Meta Platforms Inc.</option>
          <option value="NFLX">NFLX - Netflix Inc.</option>
          <option value="V">V - Visa Inc.</option>
          <option value="WMT">WMT - Walmart Inc.</option>
        </select>
        <div className="chart-info">
          <span className="chart-title">Candlestick Chart</span>
          <span className="chart-subtitle">1D Timeframe</span>
        </div>
      </div>

      <div className="chart-placeholder">
        <div className="candlestick-chart">
          {isLoading ? (
            <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              Loading chart data...
            </div>
          ) : (
            <div
              ref={chartContainerRef}
              className="chart-canvas"
              style={{ width: '100%', height: '400px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
            />
          )}
        </div>
        {chartData && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            Debug: Loaded {chartData.candlesticks?.length || 0} candlesticks for {chartData.symbol}
          </div>
        )}
      </div>

      <div className="technical-indicators">
        <h3>Technical Indicators</h3>
        <div className="indicators-grid">
          <div className="indicator-item">
            <span className="indicator-name">SMA (20)</span>
            <span className="indicator-value">{indicatorValues.sma}</span>
          </div>
          <div className="indicator-item">
            <span className="indicator-name">RSI (14)</span>
            <span className="indicator-value">{indicatorValues.rsi}</span>
          </div>
          <div className="indicator-item">
            <span className="indicator-name">MACD</span>
            <span className="indicator-value">{indicatorValues.macd}</span>
          </div>
          <div className="indicator-item">
            <span className="indicator-name">Volume</span>
            <span className="indicator-value">{indicatorValues.volume}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Removed unused GetAlertsRequest and GetAlertsResponse classes

// Initialize HTTP client for API calls (temporary replacement for gRPC)
// const client = new PortfolioServiceClient('http://localhost:8081', null, null);

// HTTP API client functions
const apiClient = {
  getPortfolio: async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/portfolio?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        stocks: data.Stocks.map(stock => ({
          id: stock.ID,
          symbol: stock.Symbol,
          name: stock.Name,
          quantity: stock.Quantity,
          purchasePrice: stock.PurchasePrice,
          currentPrice: stock.CurrentPrice,
          gainLoss: stock.GainLoss,
          gainLossPercentage: stock.GainLossPercent,
        })),
        totalValue: data.TotalValue,
        totalGainLoss: data.TotalGainLoss,
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      // Fallback to mock data
      return {
        stocks: [
          {
            id: '1',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            quantity: 10,
            purchasePrice: 150.00,
            currentPrice: 175.50,
            gainLoss: 255.00,
            gainLossPercentage: 17.00,
          },
          {
            id: '2',
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            quantity: 5,
            purchasePrice: 2800.00,
            currentPrice: 2950.00,
            gainLoss: 750.00,
            gainLossPercentage: 5.36,
          },
        ],
        totalValue: 16275.00,
        totalGainLoss: 1005.00,
      };
    }
  },

  addStock: async (userId, symbol, quantity, purchasePrice) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: 'Stock added successfully',
        stock: {
          id: Date.now().toString(),
          symbol: symbol.toUpperCase(),
          name: `${symbol.toUpperCase()} Corp.`,
          quantity: quantity,
          purchasePrice: purchasePrice,
          currentPrice: purchasePrice * 1.05,
        },
      };
    } catch (error) {
      throw new Error('Failed to add stock');
    }
  },

  removeStock: async (userId, stockId) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: 'Stock removed successfully',
      };
    } catch (error) {
      throw new Error('Failed to remove stock');
    }
  },

  setPriceAlert: async (userId, symbol, targetPrice, condition) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        message: 'Alert set successfully',
        alertId: Date.now().toString(),
      };
    } catch (error) {
      throw new Error('Failed to set alert');
    }
  },
};

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
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'ABOVE'
  });
  const [activeTab, setActiveTab] = useState('portfolio');

  const userId = 'demo-user-1';

  // Fetch portfolio and alerts on mount
  useEffect(() => {
    fetchPortfolio();
    fetchAlerts();
  }, []);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      const response = await apiClient.getPortfolio(userId);
      setPortfolio(response.stocks || []);
      setTotalValue(response.totalValue || 0);
      setTotalGainLoss(response.totalGainLoss || 0);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      // Fallback to empty portfolio
      setPortfolio([]);
      setTotalValue(0);
      setTotalGainLoss(0);
    }
  };

  // Start streaming prices (mock implementation)
  const startStreaming = () => {
    if (portfolio.length === 0) {
      alert('Add some stocks first!');
      return;
    }

    setIsStreaming(true);

    // Simulate streaming by updating prices every few seconds
    const interval = setInterval(() => {
      const symbols = portfolio.map(stock => stock.symbol || stock.getSymbol?.() || 'UNKNOWN');

      symbols.forEach(symbol => {
        // Generate small random price changes
        const change = (Math.random() - 0.5) * 10;
        const basePrice = portfolio.find(s => (s.symbol || s.getSymbol?.()) === symbol)?.currentPrice || 100;
        const newPrice = Math.max(1, basePrice + change);
        const changePercent = (change / basePrice) * 100;

        setPriceUpdates(prev => ({
          ...prev,
          [symbol]: {
            price: newPrice,
            change: change,
            changePercent: changePercent,
            timestamp: Date.now()
          }
        }));
      });
    }, 3000); // Update every 3 seconds

    // Stop streaming after 30 seconds (for demo)
    setTimeout(() => {
      clearInterval(interval);
      setIsStreaming(false);
      alert('Demo streaming ended. Real streaming will be available with gRPC backend.');
    }, 30000);
  };

  // Add new stock
  const addStock = async () => {
    if (!newStock.symbol || !newStock.quantity || !newStock.price) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await apiClient.addStock(
        userId,
        newStock.symbol.toUpperCase(),
        parseFloat(newStock.quantity),
        parseFloat(newStock.price)
      );

      if (response.success) {
        alert('Stock added successfully!');
        setNewStock({ symbol: '', quantity: '', price: '' });
        fetchPortfolio();
      } else {
        alert('Failed to add stock: ' + response.message);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Failed to add stock');
    }
  };

  // Remove stock
  const removeStock = async (stockId) => {
    try {
      const response = await apiClient.removeStock(userId, stockId);

      if (response.success) {
        alert('Stock removed successfully!');
        fetchPortfolio();
      }
    } catch (error) {
      console.error('Error removing stock:', error);
      alert('Failed to remove stock');
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/alerts?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Enhanced fallback to mock data with more realistic alerts
      setAlerts([
        {
          id: '1',
          symbol: 'AAPL',
          targetPrice: 180.00,
          condition: 0, // ABOVE
          isTriggered: false,
          createdAt: Date.now() / 1000 - 86400,
        },
        {
          id: '2',
          symbol: 'GOOGL',
          targetPrice: 2900.00,
          condition: 1, // BELOW
          isTriggered: true,
          triggeredPrice: 2850.00,
          triggeredAt: Date.now() / 1000 - 3600,
          createdAt: Date.now() / 1000 - 172800,
        },
        {
          id: '3',
          symbol: 'MSFT',
          targetPrice: 350.00,
          condition: 0, // ABOVE
          isTriggered: false,
          createdAt: Date.now() / 1000 - 432000, // 5 days ago
        },
      ]);
    }
  };

  // Set price alert
  const setAlert = async () => {
    if (!newAlert.symbol || !newAlert.targetPrice) {
      alert('Please fill all fields');
      return;
    }

    try {
      const condition = newAlert.condition === 'ABOVE' ? 0 : 1; // 0 = ABOVE, 1 = BELOW
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          symbol: newAlert.symbol.toUpperCase(),
          target_price: parseFloat(newAlert.targetPrice),
          condition: condition,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        alert('Alert set successfully!');
        setNewAlert({ symbol: '', targetPrice: '', condition: 'ABOVE' });
        fetchAlerts();
      } else {
        alert('Failed to set alert: ' + data.message);
      }
    } catch (error) {
      console.error('Error setting alert:', error);
      // Fallback: simulate successful alert creation with mock data
      const mockAlert = {
        id: Date.now().toString(),
        symbol: newAlert.symbol.toUpperCase(),
        targetPrice: parseFloat(newAlert.targetPrice),
        condition: newAlert.condition === 'ABOVE' ? 0 : 1,
        isTriggered: false,
        createdAt: Date.now() / 1000,
      };

      setAlerts(prev => [...prev, mockAlert]);
      alert('Alert set successfully! (Using mock mode)');
      setNewAlert({ symbol: '', targetPrice: '', condition: 'ABOVE' });
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>📈 Real-Time Portfolio Tracker</h1>
        <p className="subtitle">Powered by gRPC & Protocol Buffers</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Price Alerts ({alerts.length})
        </button>
        <button
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          Charts
        </button>
      </div>

      <div className="container">
        {activeTab === 'portfolio' && (
          <>
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
                // Handle both protobuf objects and plain objects
                const symbol = stock.symbol || stock.getSymbol?.() || 'UNKNOWN';
                const id = stock.id || stock.getId?.() || 'unknown';
                const quantity = stock.quantity || stock.getQuantity?.() || 0;
                const purchasePrice = stock.purchasePrice || stock.getPurchasePrice?.() || 0;
                const currentPrice = stock.currentPrice || stock.getCurrentPrice?.() || purchasePrice;

                const livePrice = priceUpdates[symbol];
                const displayPrice = livePrice ? livePrice.price : currentPrice;
                const gainLoss = (displayPrice - purchasePrice) * quantity;
                const gainLossPercent = ((displayPrice - purchasePrice) / purchasePrice) * 100;

                return (
                  <div key={id} className="stock-card">
                    <div className="stock-header">
                      <h3>{symbol}</h3>
                      {livePrice && (
                        <span className="live-indicator">🔴 LIVE</span>
                      )}
                    </div>
                    <div className="stock-details">
                      <div className="detail-row">
                        <span>Quantity:</span>
                        <span>{quantity}</span>
                      </div>
                      <div className="detail-row">
                        <span>Purchase Price:</span>
                        <span>${purchasePrice.toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Current Price:</span>
                        <span className={livePrice ? 'price-live' : ''}>
                          ${displayPrice.toFixed(2)}
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
                      onClick={() => removeStock(id)}
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
          </>
        )}

        {activeTab === 'alerts' && (
          <>
            {/* Set Alert Form */}
            <div className="card">
              <h2>Set Price Alert</h2>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Symbol (e.g., AAPL)"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value})}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Target Price"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({...newAlert, targetPrice: e.target.value})}
                  className="input"
                />
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
                  className="input"
                >
                  <option value="ABOVE">Alert when price goes ABOVE</option>
                  <option value="BELOW">Alert when price goes BELOW</option>
                </select>
                <button onClick={setAlert} className="btn btn-primary">
                  Set Alert
                </button>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="card">
              <h2>Your Alerts</h2>
              {alerts.length === 0 ? (
                <p className="empty-state">No alerts set. Create your first price alert above!</p>
              ) : (
                <div className="alerts-list">
                  {alerts.map((alert) => {
                    // Handle both protobuf objects and plain objects
                    const id = alert.id || alert.getId?.() || 'unknown';
                    const symbol = alert.symbol || alert.getSymbol?.() || 'UNKNOWN';
                    const targetPrice = alert.targetPrice || alert.getTargetPrice?.() || 0;
                    const condition = alert.condition || alert.getCondition?.() || 0;
                    const isTriggered = alert.isTriggered || alert.getIsTriggered?.() || false;
                    const triggeredPrice = alert.triggeredPrice || alert.getTriggeredPrice?.();
                    const createdAt = alert.createdAt || alert.getCreatedAt?.() || Date.now() / 1000;

                    return (
                      <div key={id} className="alert-item">
                        <div className="alert-header">
                          <h3>{symbol}</h3>
                          <span className={`alert-status ${isTriggered ? 'triggered' : 'active'}`}>
                            {isTriggered ? '✅ TRIGGERED' : '🔴 ACTIVE'}
                          </span>
                        </div>
                        <div className="alert-details">
                          <div className="detail-row">
                            <span>Target Price:</span>
                            <span>${targetPrice.toFixed(2)}</span>
                          </div>
                          <div className="detail-row">
                            <span>Condition:</span>
                            <span>{condition === 0 || condition === 'ABOVE' ? 'Goes above' : 'Goes below'}</span>
                          </div>
                          {isTriggered && triggeredPrice && (
                            <div className="detail-row">
                              <span>Triggered Price:</span>
                              <span>${triggeredPrice.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="detail-row">
                            <span>Created:</span>
                            <span>{new Date(createdAt * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'charts' && (
          <ChartsComponent />
        )}
      </div>
    </div>
  );
}

export default App;