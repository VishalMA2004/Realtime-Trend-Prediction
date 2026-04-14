import { getPool } from "../config/db.js";
import { marketEngine } from "../services/mockMarketEngine.js";
import {
  getOfficialExchangeAnalysis,
  getOfficialExchangeBoard,
  getOfficialExchangeHistory,
  getOfficialExchangePrediction,
  getOfficialExchangeStock
} from "../services/officialExchangeService.js";
import { buildAnalysis, buildPrediction } from "../services/predictionEngine.js";
import { ensureSavedStocksSchema, getSavedStocks } from "../services/userSavedStocksService.js";

const findSavedStockDetails = async (savedRows, globalStocks) => {
  const detailed = [];

  for (const row of savedRows) {
    if (row.exchange === "GLOBAL") {
      const stock = globalStocks.find((item) => item.symbol === row.symbol);
      if (stock) {
        detailed.push({ ...stock, exchange: "GLOBAL" });
      }
      continue;
    }

    const stock = await getOfficialExchangeStock(row.exchange, row.symbol);
    if (stock) {
      detailed.push(stock);
    }
  }

  return detailed;
};

export const getDashboard = async (req, res) => {
  try {
    const savedRows = await getSavedStocks(req.user.id);
    const snapshot = marketEngine.getSnapshot();

    return res.json({
      ...snapshot,
      savedStocks: await findSavedStockDetails(savedRows, snapshot.stocks),
      alerts: marketEngine.getAlerts()
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load dashboard.", detail: error.message });
  }
};

export const getStocks = async (req, res) => {
  try {
    const savedRows = await getSavedStocks(req.user.id);
    const snapshot = marketEngine.getSnapshot();

    return res.json({
      stocks: snapshot.stocks,
      savedStocks: await findSavedStockDetails(savedRows, snapshot.stocks),
      meta: snapshot.meta
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load stocks.", detail: error.message });
  }
};

export const getSavedStocksList = async (req, res) => {
  try {
    const snapshot = marketEngine.getSnapshot();
    const savedRows = await getSavedStocks(req.user.id);

    return res.json({
      stocks: await findSavedStockDetails(savedRows, snapshot.stocks)
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load saved stocks.", detail: error.message });
  }
};

export const addSavedStock = async (req, res) => {
  const { symbol, exchange = "GLOBAL" } = req.body;

  if (!symbol) {
    return res.status(400).json({ message: "Symbol is required." });
  }

  try {
    const normalizedExchange = String(exchange).toUpperCase();
    const stock =
      normalizedExchange === "GLOBAL"
        ? marketEngine.getStock(symbol)
        : await getOfficialExchangeStock(normalizedExchange, symbol);

    if (!stock) {
      return res.status(404).json({ message: "Stock not found." });
    }

    await ensureSavedStocksSchema();
    const pool = getPool();
    await pool.query("INSERT IGNORE INTO user_saved_stocks (user_id, exchange, symbol) VALUES (?, ?, ?)", [
      req.user.id,
      normalizedExchange,
      stock.symbol
    ]);

    return res.status(201).json({ stock });
  } catch (error) {
    return res.status(500).json({ message: "Unable to save stock.", detail: error.message });
  }
};

export const removeSavedStock = async (req, res) => {
  try {
    const exchange = String(req.query.exchange || "GLOBAL").toUpperCase();
    await ensureSavedStocksSchema();
    const pool = getPool();
    await pool.query("DELETE FROM user_saved_stocks WHERE user_id = ? AND exchange = ? AND symbol = ?", [
      req.user.id,
      exchange,
      req.params.symbol.toUpperCase()
    ]);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Unable to remove stock.", detail: error.message });
  }
};

export const getHistory = async (req, res) => {
  const exchange = String(req.query.exchange || "GLOBAL").toUpperCase();
  const stock =
    exchange === "GLOBAL"
      ? marketEngine.getStock(req.params.symbol)
      : await getOfficialExchangeHistory(exchange, req.params.symbol);

  if (!stock) {
    return res.status(404).json({ message: "Stock not found." });
  }

  if (exchange !== "GLOBAL") {
    return res.json(stock);
  }

  return res.json({
    symbol: stock.symbol,
    exchange,
    name: stock.name,
    history: stock.history,
    indicators: {
      support: Number((stock.price * 0.94).toFixed(2)),
      resistance: Number((stock.price * 1.07).toFixed(2)),
      volatility: `${Math.max(12, 100 - stock.score / 1.2).toFixed(1)}%`,
      conviction: stock.score
    }
  });
};

export const getExchangePage = async (req, res) => {
  const board = await getOfficialExchangeBoard(req.params.exchange, {
    search: req.query.search,
    page: req.query.page,
    pageSize: req.query.pageSize
  });

  if (!board) {
    return res.status(404).json({ message: "Exchange not found." });
  }

  const savedRows = await getSavedStocks(req.user.id);
  const savedSymbols = savedRows
    .filter((row) => row.exchange === board.exchange)
    .map((row) => row.symbol);

  return res.json({
    ...board,
    savedSymbols
  });
};

export const getAnalysis = async (req, res) => {
  const { symbol, amount = 0, years = 1, exchange = "GLOBAL" } = req.body;
  const normalizedExchange = String(exchange).toUpperCase();
  const stock =
    normalizedExchange === "GLOBAL"
      ? marketEngine.getStock(symbol)
      : await getOfficialExchangeAnalysis(normalizedExchange, symbol, amount, years);

  if (!stock) {
    return res.status(404).json({ message: "Stock not found." });
  }

  if (normalizedExchange !== "GLOBAL") {
    return res.json(stock);
  }

  return res.json({
    ...buildAnalysis(stock, amount, years),
    exchange: normalizedExchange,
    name: stock.name
  });
};

export const getPrediction = async (req, res) => {
  const exchange = String(req.query.exchange || "GLOBAL").toUpperCase();
  const result =
    exchange === "GLOBAL"
      ? (() => {
          const stock = marketEngine.getStock(req.params.symbol);
          return stock ? buildPrediction({ ...stock, exchange }) : null;
        })()
      : await getOfficialExchangePrediction(exchange, req.params.symbol);

  if (!result) {
    return res.status(404).json({ message: "Stock not found." });
  }

  return res.json(result);
};
