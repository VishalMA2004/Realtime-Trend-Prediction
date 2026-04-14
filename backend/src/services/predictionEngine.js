const round = (value) => Number(value.toFixed(2));

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

export const enrichStock = (stock, history) => {
  const cleanHistory = history.length ? history : [{ date: new Date().toISOString().slice(0, 10), price: stock.price, prediction: stock.price, sentiment: 60 }];
  const prices = cleanHistory.map((point) => point.price);
  const recentWindow = prices.slice(-5);
  const longWindow = prices.slice(-12);
  const shortAverage = average(recentWindow);
  const longAverage = average(longWindow);
  const momentum = ((prices.at(-1) - prices[0]) / prices[0]) * 100;
  const anchorPrice = prices.length >= 5 ? prices.at(-5) : prices[0];
  const acceleration = ((prices.at(-1) - anchorPrice) / anchorPrice) * 100;
  const volatility = Math.sqrt(average(prices.map((price) => (price - average(prices)) ** 2))) / average(prices) * 100;
  const sentiment = Math.max(40, Math.min(95, round(60 + momentum * 1.3 - volatility * 0.7 + acceleration * 1.1)));
  const score = Math.max(
    35,
    Math.min(
      95,
      Math.round(55 + momentum * 1.4 + acceleration * 0.9 + (shortAverage > longAverage ? 8 : -6) - volatility * 0.5)
    )
  );
  const projectedMove = Math.max(-0.08, Math.min(0.18, (score - 55) / 300 + acceleration / 150));
  const projectedPrice = round(stock.price * (1 + projectedMove));
  const support = round(Math.min(...prices.slice(-8)));
  const resistance = round(Math.max(...prices.slice(-8)));
  const direction = score >= 70 ? "UP" : score <= 50 ? "DOWN" : "SIDEWAYS";
  const outlook =
    score >= 78 ? "Strong Buy" : score >= 68 ? "Bullish" : score >= 58 ? "Accumulate" : score >= 50 ? "Watch" : "Reduce";

  return {
    ...stock,
    history: cleanHistory.map((point) => ({
      ...point,
      prediction: point.prediction ?? projectedPrice,
      sentiment: point.sentiment ?? sentiment
    })),
    score,
    projectedPrice,
    direction,
    outlook,
    sentiment,
    support,
    resistance,
    volatility: `${round(volatility)}%`
  };
};

export const buildAnalysis = (stock, amount, years) => {
  const shares = Math.floor(Number(amount) / stock.price);
  const invested = round(shares * stock.price);
  const cagr = Math.max(-0.05, Math.min(0.28, (stock.score - 50) / 250 + 0.08));
  const projectedValue = round(invested * (1 + cagr * Number(years)));
  const projectedProfit = round(projectedValue - invested);

  return {
    symbol: stock.symbol,
    currentPrice: stock.price,
    shares,
    invested,
    projectedValue,
    projectedProfit,
    recommendation:
      stock.score >= 72 ? "Accumulation zone" : stock.score >= 58 ? "Staggered entry" : "Wait for confirmation",
    expectedReturnRate: `${round(cagr * 100)}%`,
    support: stock.support,
    resistance: stock.resistance
  };
};

export const buildPrediction = (stock) => {
  const history = stock.history || [];
  const latestPrice = stock.price;
  const momentumBias = (stock.score - 55) / 220;
  const volatilityFactor = Number.parseFloat(String(stock.volatility || "8").replace("%", "")) / 100;
  const shortTermMultiplier = 1 + momentumBias * 0.6;
  const mediumTermMultiplier = 1 + momentumBias * 1.05;
  const longTermMultiplier = 1 + momentumBias * 1.55;
  const shortTerm = Number((latestPrice * shortTermMultiplier).toFixed(2));
  const mediumTerm = Number((latestPrice * mediumTermMultiplier).toFixed(2));
  const longTerm = Number((latestPrice * longTermMultiplier).toFixed(2));
  const confidence = Math.max(52, Math.min(94, Math.round(stock.score - volatilityFactor * 100 * 0.7)));
  const support = stock.support ?? Number((latestPrice * 0.94).toFixed(2));
  const resistance = stock.resistance ?? Number((latestPrice * 1.07).toFixed(2));
  const projectedSeries = [
    { horizon: "Now", price: latestPrice },
    { horizon: "7 Days", price: shortTerm },
    { horizon: "30 Days", price: mediumTerm },
    { horizon: "90 Days", price: longTerm }
  ];

  return {
    symbol: stock.symbol,
    exchange: stock.exchange || "GLOBAL",
    name: stock.name,
    currentPrice: latestPrice,
    direction: stock.direction,
    confidence: `${confidence}%`,
    support,
    resistance,
    shortTermPrediction: shortTerm,
    mediumTermPrediction: mediumTerm,
    longTermPrediction: longTerm,
    projectedSeries,
    history: history.slice(-20),
    keyDrivers: [
      `Momentum score ${stock.score} with ${stock.direction.toLowerCase()} setup`,
      `Support near ${support} and resistance near ${resistance}`,
      `Projected trend strength influenced by ${stock.volatility || "moderate"} volatility`
    ]
  };
};
