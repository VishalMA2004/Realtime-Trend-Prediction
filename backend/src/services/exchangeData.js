export const buildExchangeStocks = (exchange, rows) =>
  rows.map((stock, index) => {
    const score = stock.score ?? (stock.change >= 0 ? 62 + index * 3 : 48 - index * 2);
    const projectedPrice = stock.price ? Number((stock.price * (1 + score / 900)).toFixed(2)) : null;

    return {
      ...stock,
      exchange,
      score,
      projectedPrice,
      direction: score >= 70 ? "UP" : score <= 50 ? "DOWN" : "SIDEWAYS"
    };
  });

export const exchangeBoards = {
  NSE: {
    indexName: "NIFTY 50",
    indexValue: "22,436.10",
    change: "+1.18%",
    overview:
      "NSE board focuses on fast-moving Indian large caps, sector rotation, and intraday breadth for the next-session setup.",
    stocks: buildExchangeStocks("NSE", [
      { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", price: 2948.4, change: 1.9, volume: 1200000 },
      { symbol: "TCS", name: "Tata Consultancy", sector: "IT", price: 4012.55, change: 1.1, volume: 640000 },
      { symbol: "INFY", name: "Infosys", sector: "IT", price: 1523.7, change: 0.8, volume: 880000 },
      { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1678.15, change: -0.6, volume: 790000 },
      { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", price: 1098.4, change: 1.3, volume: 910000 },
      { symbol: "SBIN", name: "State Bank of India", sector: "Banking", price: 812.3, change: -1.1, volume: 1020000 }
    ])
  },
  BSE: {
    indexName: "SENSEX",
    indexValue: "73,881.44",
    change: "+0.94%",
    overview:
      "BSE board highlights heavyweight movers, broader sentiment, and trend strength for long-term and next-day planning.",
    stocks: buildExchangeStocks("BSE", [
      { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", price: 436.25, change: 0.7, volume: 960000 },
      { symbol: "LT", name: "Larsen & Toubro", sector: "Infra", price: 3680.45, change: 1.5, volume: 520000 },
      { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", price: 12640.15, change: 0.9, volume: 210000 },
      { symbol: "ASIANPAINT", name: "Asian Paints", sector: "Consumer", price: 2877.8, change: -0.5, volume: 190000 },
      { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", price: 1624.35, change: 1.2, volume: 340000 },
      { symbol: "TITAN", name: "Titan Company", sector: "Consumer", price: 3581.55, change: -0.8, volume: 270000 }
    ])
  }
};

export const getFallbackExchangeBoard = (exchange) => {
  const board = exchangeBoards[exchange?.toUpperCase()];

  if (!board) {
    return null;
  }

  const sorted = [...board.stocks].sort((a, b) => b.change - a.change);

  return {
    exchange: exchange.toUpperCase(),
    indexName: board.indexName,
    indexValue: board.indexValue,
    change: board.change,
    overview: board.overview,
    gainers: sorted.slice(0, 3),
    losers: sorted.slice(-3).reverse(),
    topPicks: [...board.stocks].sort((a, b) => b.score - a.score).slice(0, 3),
    stocks: board.stocks
  };
};
