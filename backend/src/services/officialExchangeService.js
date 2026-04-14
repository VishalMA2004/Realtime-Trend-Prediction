import { buildExchangeStocks, getFallbackExchangeBoard } from "./exchangeData.js";
import { generateHistory } from "./marketData.js";
import { buildAnalysis, buildPrediction, enrichStock } from "./predictionEngine.js";

const NSE_LIST_URL = "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv";
const BSE_BHAVCOPY_PAGE = "https://www.bseindia.com/markets/MarketInfo/BhavCopy.aspx?ln=en-us";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

const exchangeMeta = {
  NSE: {
    indexName: "NIFTY 50",
    indexValue: "Official NSE list",
    change: "Live by symbol lookup",
    overview:
      "Official NSE securities list pulled from NSE archives. Use search to browse the exchange universe and shortlist companies for deeper tracking."
  },
  BSE: {
    indexName: "BSE Equity Bhav Copy",
    indexValue: "Official BSE daily file",
    change: "Latest available session",
    overview:
      "Official BSE equity bhav copy pulled from the latest BSE market file. Use search to browse the exchange-wide equity board for the current session."
  }
};

const cache = new Map();
const hashCode = (value) =>
  [...String(value)].reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const parseCsv = (text) => {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const row = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, idx) => [header, row[idx] ?? ""]));
  });
};

const toNumber = (value) => {
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const scoreFromChange = (change) => Math.max(35, Math.min(92, Math.round(58 + change * 7)));

const ensureFeatureFields = (exchange, stock) => {
  const basePrice =
    stock.price && stock.price > 0
      ? stock.price
      : Number((80 + (hashCode(`${exchange}:${stock.symbol}`) % 9000) / 10).toFixed(2));
  const baseChange =
    Number.isFinite(stock.change) && stock.change !== 0
      ? stock.change
      : Number((((hashCode(stock.symbol) % 600) - 300) / 100).toFixed(2));
  const withPrice = {
    ...stock,
    exchange,
    price: basePrice,
    change: baseChange
  };
  return enrichStock(withPrice, generateHistory(stock.symbol, basePrice));
};

const withComputedFields = (exchange, stocks) =>
  buildExchangeStocks(
    exchange,
    stocks.map((stock) => ({
      ...stock,
      score: scoreFromChange(stock.change)
    }))
  ).map((stock) => ensureFeatureFields(exchange, stock));

const fetchBseLatestCsvUrl = async () => {
  const response = await fetch(BSE_BHAVCOPY_PAGE);

  if (!response.ok) {
    throw new Error(`BSE page request failed with status ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/href="(https:\/\/www\.bseindia\.com\/download\/BhavCopy\/Equity\/BhavCopy_BSE_CM_[^"]+\.CSV)"/i);

  if (!match) {
    throw new Error("Unable to locate latest BSE equity bhav copy link.");
  }

  return match[1];
};

const fetchNseStocks = async () => {
  const response = await fetch(NSE_LIST_URL);

  if (!response.ok) {
    throw new Error(`NSE list request failed with status ${response.status}`);
  }

  const csv = await response.text();
  const rows = parseCsv(csv)
    .filter((row) => row.SYMBOL && row["NAME OF COMPANY"])
    .map((row) => ({
      symbol: row.SYMBOL,
      name: row["NAME OF COMPANY"],
      sector: row.SERIES || "EQ",
      price: 0,
      change: 0,
      volume: 0,
      isin: row["ISIN NUMBER"],
      listingDate: row["DATE OF LISTING"]
    }));

  return withComputedFields("NSE", rows);
};

const fetchBseStocks = async () => {
  const csvUrl = await fetchBseLatestCsvUrl();
  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new Error(`BSE equity file request failed with status ${response.status}`);
  }

  const csv = await response.text();
  const rows = parseCsv(csv)
    .filter((row) => row.Sgmt === "CM" && row.FinInstrmTp === "STK" && row.TckrSymb)
    .map((row) => {
      const previous = toNumber(row.PrvsClsgPric);
      const close = toNumber(row.ClsPric || row.LastPric);
      const change = previous ? Number((((close - previous) / previous) * 100).toFixed(2)) : 0;

      return {
        symbol: row.TckrSymb,
        name: row.FinInstrmNm,
        sector: row.SctySrs || "EQ",
        price: close,
        change,
        volume: toNumber(row.TtlTradgVol),
        isin: row.ISIN,
        code: row.FinInstrmId
      };
    });

  return withComputedFields("BSE", rows);
};

const loadExchangeStocks = async (exchange) => {
  if (exchange === "NSE") {
    return fetchNseStocks();
  }

  if (exchange === "BSE") {
    return fetchBseStocks();
  }

  throw new Error("Exchange not supported.");
};

const getCachedExchangeStocks = async (exchange) => {
  const key = exchange.toUpperCase();
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.stocks;
  }

  const stocks = await loadExchangeStocks(key);
  cache.set(key, { stocks, timestamp: Date.now() });
  return stocks;
};

export const getOfficialExchangeBoard = async (exchange, options = {}) => {
  const key = exchange?.toUpperCase();

  if (!exchangeMeta[key]) {
    return null;
  }

  const search = (options.search || "").trim().toUpperCase();
  const page = Math.max(1, Number(options.page || 1));
  const pageSize = Math.max(25, Math.min(200, Number(options.pageSize || 100)));

  try {
    const stocks = await getCachedExchangeStocks(key);
    const filtered = search
      ? stocks.filter(
          (stock) =>
            stock.symbol.includes(search) ||
            stock.name.toUpperCase().includes(search) ||
            String(stock.isin || "").toUpperCase().includes(search)
        )
      : stocks;
    const sorted = [...filtered].sort((a, b) => (b.change || 0) - (a.change || 0));
    const start = (page - 1) * pageSize;

    return {
      exchange: key,
      ...exchangeMeta[key],
      source: key === "NSE" ? "NSE official securities list" : "BSE official daily equity bhav copy",
      total: filtered.length,
      page,
      pageSize,
      search,
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
      topPicks: [...filtered].sort((a, b) => b.score - a.score).slice(0, 5),
      stocks: filtered.slice(start, start + pageSize)
    };
  } catch (_error) {
    const fallback = getFallbackExchangeBoard(key);

    return fallback
      ? {
          ...fallback,
          source: "Fallback sample board",
          total: fallback.stocks.length,
          page: 1,
          pageSize: fallback.stocks.length,
          search: ""
        }
      : null;
  }
};

export const getOfficialExchangeStock = async (exchange, symbol) => {
  const board = await getOfficialExchangeBoard(exchange, {
    search: symbol,
    page: 1,
    pageSize: 25
  });

  return board?.stocks.find((stock) => stock.symbol === symbol?.toUpperCase()) || null;
};

export const getOfficialExchangeHistory = async (exchange, symbol) => {
  const stock = await getOfficialExchangeStock(exchange, symbol);

  if (!stock) {
    return null;
  }

  return {
    symbol: stock.symbol,
    exchange: stock.exchange,
    name: stock.name,
    history: stock.history,
    indicators: {
      support: stock.support,
      resistance: stock.resistance,
      volatility: stock.volatility,
      conviction: stock.score
    }
  };
};

export const getOfficialExchangeAnalysis = async (exchange, symbol, amount, years) => {
  const stock = await getOfficialExchangeStock(exchange, symbol);

  if (!stock) {
    return null;
  }

  return {
    ...buildAnalysis(stock, amount, years),
    exchange: stock.exchange,
    name: stock.name
  };
};

export const getOfficialExchangePrediction = async (exchange, symbol) => {
  const stock = await getOfficialExchangeStock(exchange, symbol);

  if (!stock) {
    return null;
  }

  return buildPrediction(stock);
};
