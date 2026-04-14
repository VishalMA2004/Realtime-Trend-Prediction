import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import client from "../api/client";
import TrendChart from "../components/charts/TrendChart";

export default function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedStocks, setSavedStocks] = useState([]);
  const [selected, setSelected] = useState(searchParams.get("symbol") || "AAPL");
  const [selectedExchange, setSelectedExchange] = useState(searchParams.get("exchange") || "GLOBAL");
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    client
      .get("/stocks/saved")
      .then(({ data }) => setSavedStocks(data.stocks))
      .catch(() => setSavedStocks([]));
  }, []);

  useEffect(() => {
    setSearchParams({ symbol: selected, exchange: selectedExchange });
    client
      .get(`/stocks/history/${selected}`, { params: { exchange: selectedExchange } })
      .then(({ data }) => setHistoryData(data));
  }, [selected, selectedExchange, setSearchParams]);

  const options = [
    { symbol: selected, exchange: selectedExchange, label: `${selected} (${selectedExchange})` },
    { symbol: "AAPL", exchange: "GLOBAL", label: "AAPL (Global)" },
    { symbol: "MSFT", exchange: "GLOBAL", label: "MSFT (Global)" },
    { symbol: "NVDA", exchange: "GLOBAL", label: "NVDA (Global)" },
    ...savedStocks.map((stock) => ({
      symbol: stock.symbol,
      exchange: stock.exchange,
      label: `${stock.symbol} (${stock.exchange})`
    }))
  ].filter(
    (option, index, list) =>
      index === list.findIndex((item) => item.symbol === option.symbol && item.exchange === option.exchange)
  );

  return (
    <div className="page-grid">
      <section className="panel chart-span">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Saved stock history</span>
            <h3>Open history directly from your watchlist</h3>
          </div>
        </div>
        {savedStocks.length ? (
          <div className="saved-history-grid">
            {savedStocks.map((stock) => {
              const isActive = stock.symbol === selected && stock.exchange === selectedExchange;

              return (
                <button
                  key={`${stock.exchange}-${stock.symbol}`}
                  className={`saved-history-card ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setSelected(stock.symbol);
                    setSelectedExchange(stock.exchange);
                  }}
                >
                  <span className="sector-tag">{stock.exchange}</span>
                  <strong>{stock.symbol}</strong>
                  <p>{stock.name}</p>
                  <small>
                    Score {stock.score} • {stock.direction}
                  </small>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            Save stocks from the Stocks, NSE, or BSE pages to build a dedicated history watchlist here.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Historical intelligence</span>
            <h3>Advanced graph analysis</h3>
          </div>
          <select
            value={`${selectedExchange}:${selected}`}
            onChange={(event) => {
              const [exchange, symbol] = event.target.value.split(":");
              setSelected(symbol);
              setSelectedExchange(exchange);
            }}
          >
            {options.map((option) => (
              <option key={`${option.exchange}-${option.symbol}`} value={`${option.exchange}:${option.symbol}`}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {historyData ? <TrendChart data={historyData.history} /> : <div>Loading...</div>}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Sentiment vs prediction</span>
            <h3>Momentum confirmation chart</h3>
          </div>
        </div>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData?.history || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="prediction" stroke="#f59e0b" strokeWidth={3} />
              <Line type="monotone" dataKey="sentiment" stroke="#38bdf8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Trading zones</span>
            <h3>Support and resistance view</h3>
          </div>
        </div>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={
                historyData
                  ? [
                      {
                        name: historyData.symbol,
                        support: historyData.indicators.support,
                        resistance: historyData.indicators.resistance,
                        current: historyData.history.at(-1)?.price
                      }
                    ]
                  : []
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="support" fill="#22c55e" />
              <Bar dataKey="current" fill="#38bdf8" />
              <Bar dataKey="resistance" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="metric-stack">
          <div className="metric-card">
            <span>Support</span>
            <strong>{historyData?.indicators.support}</strong>
          </div>
          <div className="metric-card">
            <span>Resistance</span>
            <strong>{historyData?.indicators.resistance}</strong>
          </div>
          <div className="metric-card">
            <span>Volatility</span>
            <strong>{historyData?.indicators.volatility}</strong>
          </div>
          <div className="metric-card">
            <span>Conviction</span>
            <strong>{historyData?.indicators.conviction}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
