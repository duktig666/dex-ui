// Mock K-line data generator for TradingView

export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Base prices for different symbols
const BASE_PRICES: Record<string, number> = {
  'BTC-USDC': 90941,
  'ETH-USDC': 3096.6,
  'HYPE-USDC': 23.12,
  'SOL-USDC': 185.5,
};

// Volatility factors for different symbols (percentage)
const VOLATILITY: Record<string, number> = {
  'BTC-USDC': 0.02,
  'ETH-USDC': 0.025,
  'HYPE-USDC': 0.05,
  'SOL-USDC': 0.035,
};

// Resolution to milliseconds
const RESOLUTION_MS: Record<string, number> = {
  '1': 60 * 1000,
  '5': 5 * 60 * 1000,
  '15': 15 * 60 * 1000,
  '30': 30 * 60 * 1000,
  '60': 60 * 60 * 1000,
  '240': 4 * 60 * 60 * 1000,
  '1D': 24 * 60 * 60 * 1000,
  '1W': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
};

// Seeded random for consistent data
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate a single bar
function generateBar(symbol: string, timestamp: number, prevClose: number, seed: number): Bar {
  const volatility = VOLATILITY[symbol] || 0.02;

  const random1 = seededRandom(seed);
  const random2 = seededRandom(seed + 1);
  const random3 = seededRandom(seed + 2);
  const random4 = seededRandom(seed + 3);

  // Determine trend bias
  const trendBias = (random1 - 0.5) * volatility * 2;

  // Generate OHLC
  const open = prevClose;
  const changePercent = trendBias + (random2 - 0.5) * volatility;
  const close = open * (1 + changePercent);

  // High and low based on volatility
  const range = Math.abs(close - open) + prevClose * volatility * random3;
  const high = Math.max(open, close) + range * random4 * 0.5;
  const low = Math.min(open, close) - range * (1 - random4) * 0.5;

  // Volume (higher on bigger moves)
  const baseVolume = BASE_PRICES[symbol] > 1000 ? 100 : 10000;
  const volume = baseVolume * (0.5 + random1) * (1 + Math.abs(changePercent) * 10);

  return {
    time: timestamp,
    open: Number(open.toFixed(symbol.includes('BTC') ? 1 : 4)),
    high: Number(high.toFixed(symbol.includes('BTC') ? 1 : 4)),
    low: Number(low.toFixed(symbol.includes('BTC') ? 1 : 4)),
    close: Number(close.toFixed(symbol.includes('BTC') ? 1 : 4)),
    volume: Number(volume.toFixed(2)),
  };
}

// Generate historical bars
export function generateMockBars(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Bar[] {
  const bars: Bar[] = [];
  const intervalMs = RESOLUTION_MS[resolution] || RESOLUTION_MS['60'];
  const basePrice = BASE_PRICES[symbol] || 100;

  // Align timestamps to resolution
  const alignedFrom = Math.floor(from / intervalMs) * intervalMs;
  const alignedTo = Math.floor(to / intervalMs) * intervalMs;

  let currentTime = alignedFrom;
  let prevClose = basePrice * (0.95 + seededRandom(alignedFrom) * 0.1); // Start with some variation
  let seed = alignedFrom;

  while (currentTime <= alignedTo) {
    const bar = generateBar(symbol, currentTime, prevClose, seed);
    bars.push(bar);
    prevClose = bar.close;
    currentTime += intervalMs;
    seed += 100;
  }

  return bars;
}

// Get current price for a symbol
export function getCurrentPrice(symbol: string): number {
  const basePrice = BASE_PRICES[symbol] || 100;
  const volatility = VOLATILITY[symbol] || 0.02;
  const now = Date.now();
  const random = seededRandom(Math.floor(now / 1000));
  return basePrice * (1 + (random - 0.5) * volatility);
}

// Mock order book data
export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export function generateMockOrderBook(
  symbol: string,
  depth: number = 20
): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const basePrice = BASE_PRICES[symbol] || 100;
  const spread = basePrice * 0.0001; // 0.01% spread

  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < depth; i++) {
    const seed = Date.now() + i;
    const bidPrice = basePrice - spread / 2 - i * (basePrice * 0.0001);
    const askPrice = basePrice + spread / 2 + i * (basePrice * 0.0001);

    const bidAmount = (seededRandom(seed) * 10 + 0.1).toFixed(5);
    const askAmount = (seededRandom(seed + 1000) * 10 + 0.1).toFixed(5);

    bidTotal += parseFloat(bidAmount);
    askTotal += parseFloat(askAmount);

    bids.push({
      price: Number(bidPrice.toFixed(symbol.includes('BTC') ? 0 : 2)),
      amount: Number(bidAmount),
      total: Number(bidTotal.toFixed(5)),
    });

    asks.push({
      price: Number(askPrice.toFixed(symbol.includes('BTC') ? 0 : 2)),
      amount: Number(askAmount),
      total: Number(askTotal.toFixed(5)),
    });
  }

  return { bids, asks };
}

// Mock recent trades
export interface Trade {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  time: number;
}

export function generateMockTrades(symbol: string, count: number = 50): Trade[] {
  const trades: Trade[] = [];
  const basePrice = BASE_PRICES[symbol] || 100;
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const seed = now - i * 1000;
    const random = seededRandom(seed);
    const price = basePrice * (1 + (random - 0.5) * 0.001);
    const amount = seededRandom(seed + 1) * 2 + 0.01;
    const side = seededRandom(seed + 2) > 0.5 ? 'buy' : 'sell';

    trades.push({
      id: `${seed}`,
      price: Number(price.toFixed(symbol.includes('BTC') ? 1 : 4)),
      amount: Number(amount.toFixed(5)),
      side,
      time: now - i * (seededRandom(seed + 3) * 5000 + 1000),
    });
  }

  return trades;
}

// Market data for price bar
export interface MarketData {
  symbol: string;
  markPrice: number;
  oraclePrice: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  openInterest: number;
  fundingRate: number;
  fundingCountdown: string;
}

export function getMarketData(symbol: string): MarketData {
  const basePrice = BASE_PRICES[symbol] || 100;
  const random = seededRandom(Date.now() / 10000);

  const markPrice = basePrice * (1 + (random - 0.5) * 0.001);
  const oraclePrice = markPrice * (1 + (seededRandom(random * 1000) - 0.5) * 0.0005);
  const changePercent = (seededRandom(random * 2000) - 0.5) * 10; // -5% to +5%
  const change24h = (basePrice * changePercent) / 100;

  // Calculate funding countdown (time to next hour)
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  const diff = nextHour.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return {
    symbol,
    markPrice: Number(markPrice.toFixed(symbol.includes('BTC') ? 0 : 2)),
    oraclePrice: Number(oraclePrice.toFixed(symbol.includes('BTC') ? 0 : 2)),
    change24h: Number(change24h.toFixed(1)),
    changePercent24h: Number(changePercent.toFixed(2)),
    volume24h: basePrice * 1000000 * (0.5 + random),
    openInterest: basePrice * 500000 * (0.5 + random),
    fundingRate: (seededRandom(random * 3000) - 0.5) * 0.02,
    fundingCountdown: `${minutes}:${seconds.toString().padStart(2, '0')}`,
  };
}
