export const baseStocks = [
  { symbol: "AAPL", name: "Apple", sector: "Technology", price: 191.18, change: 1.12, volume: 84000000, score: 78, outlook: "Bullish" },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology", price: 427.44, change: 0.84, volume: 32000000, score: 75, outlook: "Bullish" },
  { symbol: "NVDA", name: "NVIDIA", sector: "Semiconductor", price: 939.66, change: 2.41, volume: 54000000, score: 86, outlook: "Strong Buy" },
  { symbol: "TSLA", name: "Tesla", sector: "Automotive", price: 178.14, change: -1.72, volume: 69000000, score: 49, outlook: "Watch" },
  { symbol: "AMZN", name: "Amazon", sector: "Consumer", price: 183.4, change: 0.56, volume: 41000000, score: 69, outlook: "Accumulate" },
  { symbol: "META", name: "Meta", sector: "Technology", price: 501.34, change: 1.48, volume: 24000000, score: 73, outlook: "Bullish" },
  { symbol: "GOOGL", name: "Alphabet", sector: "Technology", price: 162.94, change: 0.72, volume: 27000000, score: 67, outlook: "Accumulate" },
  { symbol: "JPM", name: "JPMorgan", sector: "Financial", price: 196.77, change: -0.41, volume: 15000000, score: 61, outlook: "Stable" },
  { symbol: "AMD", name: "AMD", sector: "Semiconductor", price: 172.23, change: 1.91, volume: 36000000, score: 72, outlook: "Bullish" },
  { symbol: "NFLX", name: "Netflix", sector: "Media", price: 642.58, change: 0.96, volume: 9000000, score: 65, outlook: "Positive" }
];

export const generateHistory = (_symbol, currentPrice) => {
  const history = [];
  let price = currentPrice * 0.88;

  for (let index = 30; index >= 0; index -= 1) {
    const drift = Math.sin(index / 4) * 1.8;
    const noise = ((index % 5) - 2) * 0.6;
    price = Math.max(price + drift + noise, currentPrice * 0.55);

    history.push({
      date: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
      price: Number(price.toFixed(2)),
      prediction: Number((price * (1 + (31 - index) * 0.0025)).toFixed(2)),
      sentiment: 55 + ((31 - index) % 10) * 3
    });
  }

  return history.map((point, idx) =>
    idx === history.length - 1 ? { ...point, price: currentPrice } : point
  );
};
