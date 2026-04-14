import { env } from "../config/env.js";
import { baseStocks, generateHistory } from "./marketData.js";
import { fetchLiveMarketDataset, hasLiveProvider } from "./marketDataProvider.js";
import { enrichStock } from "./predictionEngine.js";

class MockMarketEngine {
  constructor() {
    this.stocks = baseStocks.map((stock) => enrichStock(stock, generateHistory(stock.symbol, stock.price)));
    this.io = null;
    this.tickTimer = null;
    this.refreshTimer = null;
    this.meta = {
      source: "simulated",
      lastUpdated: new Date().toISOString(),
      providerReady: hasLiveProvider()
    };
  }

  async connect(io) {
    this.io = io;
    await this.refreshMarketData();

    if (!this.tickTimer) {
      this.tickTimer = setInterval(() => this.tick(), env.marketTickMs);
    }

    if (!this.refreshTimer && hasLiveProvider()) {
      this.refreshTimer = setInterval(() => {
        this.refreshMarketData().catch(() => null);
      }, env.marketRefreshMs);
    }
  }

  async refreshMarketData() {
    try {
      const dataset = await fetchLiveMarketDataset();

      if (!dataset) {
        this.meta = {
          source: "simulated",
          lastUpdated: new Date().toISOString(),
          providerReady: false
        };
        return;
      }

      this.stocks = dataset.stocks.map(({ stock, history }) => enrichStock(stock, history));
      this.meta = {
        source: dataset.provider,
        lastUpdated: dataset.fetchedAt,
        providerReady: true
      };
      this.broadcast();
    } catch (_error) {
      this.meta = {
        source: "simulated-fallback",
        lastUpdated: new Date().toISOString(),
        providerReady: hasLiveProvider()
      };
    }
  }

  tick() {
    this.stocks = this.stocks.map((stock, index) => {
      const wave = Math.sin(Date.now() / 60000 + index) * 0.9;
      const change = Number((wave + ((index % 3) - 1) * 0.3).toFixed(2));
      const price = Number(Math.max(stock.price + change, 20).toFixed(2));
      const nextPoint = {
        date: new Date().toISOString().slice(0, 10),
        price,
        prediction: Number((price * (1 + stock.score / 700)).toFixed(2)),
        sentiment: Math.max(40, Math.min(95, stock.history.at(-1).sentiment + Math.round(change * 3)))
      };
      const history = [...stock.history.slice(-29), nextPoint];
      return enrichStock(
        {
          ...stock,
          price,
          change: Number((((price - history[0].price) / history[0].price) * 100).toFixed(2))
        },
        history
      );
    });

    this.meta.lastUpdated = new Date().toISOString();
    this.broadcast();
  }

  broadcast() {
    if (!this.io) {
      return;
    }

    this.io.emit("market:update", this.getSnapshot());
    this.io.emit("market:alerts", this.getAlerts());
  }

  getSnapshot() {
    const sorted = [...this.stocks].sort((a, b) => b.change - a.change);
    return {
      stocks: this.stocks,
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
      marketStatus: this.getMarketStatus(),
      recommendations: this.getNextDayPicks(),
      meta: this.meta
    };
  }

  getStock(symbol) {
    return this.stocks.find((stock) => stock.symbol === symbol?.toUpperCase());
  }

  getAlerts() {
    const alerts = [
      { id: "open", type: "market", message: this.getMarketStatus().message, time: new Date().toLocaleTimeString() }
    ];

    this.stocks
      .filter((stock) => stock.score >= 75 || stock.score <= 45)
      .slice(0, 4)
      .forEach((stock) => {
        alerts.push({
          id: `${stock.symbol}-${stock.score}`,
          type: stock.score >= 75 ? "buy" : "sell",
          message: `${stock.symbol} is flashing a ${stock.score >= 75 ? "buy" : "risk"} signal at ${stock.price}.`,
          time: new Date().toLocaleTimeString()
        });
      });

    return alerts;
  }

  getNextDayPicks() {
    return [...this.stocks]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((stock, index) => ({
        rank: index + 1,
        symbol: stock.symbol,
        name: stock.name,
        confidence: `${stock.score}%`,
        reason: `${stock.outlook} setup with projected move toward ${stock.projectedPrice}.`
      }));
  }

  getMarketStatus() {
    const hour = new Date().getHours();

    if (hour < 9) {
      return { state: "PRE_MARKET", message: "Market opens soon. Watch early momentum and gap moves." };
    }

    if (hour < 15) {
      return { state: "OPEN", message: "Market is open. Realtime signals are actively updating." };
    }

    return { state: "CLOSING", message: "Market is nearing close or closed. Review tomorrow's watchlist." };
  }
}

export const marketEngine = new MockMarketEngine();
