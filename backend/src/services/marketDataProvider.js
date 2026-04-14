import { env } from "../config/env.js";
import { baseStocks, generateHistory } from "./marketData.js";

const quoteUrl = (symbols) =>
  `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${env.twelveDataApiKey}`;

const timeSeriesUrl = (symbol) =>
  `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=30&apikey=${env.twelveDataApiKey}`;

const normalizeQuote = (rawQuote, baseStock) => {
  const price = Number(rawQuote.close || rawQuote.previous_close || baseStock.price);
  const change = Number(rawQuote.percent_change || baseStock.change || 0);

  return {
    ...baseStock,
    price: Number.isFinite(price) ? price : baseStock.price,
    change: Number.isFinite(change) ? change : baseStock.change,
    volume: Number(rawQuote.volume || baseStock.volume)
  };
};

const normalizeHistory = (values, fallbackPrice) =>
  values
    .slice()
    .reverse()
    .map((point, index, items) => {
      const price = Number(point.close || fallbackPrice);
      const progress = index / Math.max(items.length - 1, 1);
      const sentiment = Math.round(52 + progress * 28);

      return {
        date: point.datetime?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        price,
        prediction: Number((price * (1 + progress * 0.08)).toFixed(2)),
        sentiment
      };
    });

export const hasLiveProvider = () => Boolean(env.twelveDataApiKey && env.marketDataProvider === "twelve-data");

export const fetchLiveMarketDataset = async () => {
  if (!hasLiveProvider()) {
    return null;
  }

  const symbols = baseStocks.map((stock) => stock.symbol);
  const quoteResponse = await fetch(quoteUrl(symbols));

  if (!quoteResponse.ok) {
    throw new Error(`Quote request failed with status ${quoteResponse.status}`);
  }

  const quoteData = await quoteResponse.json();
  const quoteMap = Array.isArray(quoteData)
    ? Object.fromEntries(quoteData.map((item) => [item.symbol, item]))
    : quoteData;

  const stocks = await Promise.all(
    baseStocks.map(async (baseStock) => {
      const liveStock = normalizeQuote(quoteMap[baseStock.symbol] || {}, baseStock);
      const historyResponse = await fetch(timeSeriesUrl(baseStock.symbol));

      if (!historyResponse.ok) {
        return {
          stock: liveStock,
          history: generateHistory(baseStock.symbol, liveStock.price)
        };
      }

      const historyData = await historyResponse.json();
      const history = Array.isArray(historyData.values)
        ? normalizeHistory(historyData.values, liveStock.price)
        : generateHistory(baseStock.symbol, liveStock.price);

      return {
        stock: liveStock,
        history
      };
    })
  );

  return {
    provider: "twelve-data",
    fetchedAt: new Date().toISOString(),
    stocks
  };
};
