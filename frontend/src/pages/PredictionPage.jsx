import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
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

export default function PredictionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedStocks, setSavedStocks] = useState([]);
  const [selection, setSelection] = useState({
    symbol: searchParams.get("symbol") || "NVDA",
    exchange: searchParams.get("exchange") || "GLOBAL"
  });
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    client
      .get("/stocks/saved")
      .then(({ data }) => setSavedStocks(data.stocks))
      .catch(() => setSavedStocks([]));
  }, []);

  useEffect(() => {
    setSearchParams(selection);
    client
      .get(`/stocks/prediction/${selection.symbol}`, { params: { exchange: selection.exchange } })
      .then(({ data }) => setPrediction(data));
  }, [selection, setSearchParams]);

  const options = [
    selection,
    { symbol: "NVDA", exchange: "GLOBAL" },
    { symbol: "AAPL", exchange: "GLOBAL" },
    { symbol: "MSFT", exchange: "GLOBAL" },
    ...savedStocks.map((stock) => ({ symbol: stock.symbol, exchange: stock.exchange }))
  ].filter(
    (option, index, list) =>
      index ===
      list.findIndex((item) => item.symbol === option.symbol && item.exchange === option.exchange)
  );

  if (!prediction) {
    return <div className="panel">Loading prediction...</div>;
  }

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Prediction engine</span>
          <h2>
            {prediction.symbol} ({prediction.exchange})
          </h2>
          <p>
            Forecast the selected stock price using recent trend behavior, support and resistance
            zones, and direction strength from the current model.
          </p>
          <div className="meta-line">Confidence: {prediction.confidence}</div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div>
              <span>Current price</span>
              <strong>{prediction.currentPrice}</strong>
            </div>
          </div>
          <div className="stat-card success">
            <div>
              <span>7 day target</span>
              <strong>{prediction.shortTermPrediction}</strong>
            </div>
          </div>
          <div className="stat-card warning">
            <div>
              <span>30 day target</span>
              <strong>{prediction.mediumTermPrediction}</strong>
            </div>
          </div>
          <div className="stat-card danger">
            <div>
              <span>90 day target</span>
              <strong>{prediction.longTermPrediction}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel chart-span">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Select stock</span>
            <h3>Run prediction for any saved or featured stock</h3>
          </div>
          <select
            value={`${selection.exchange}:${selection.symbol}`}
            onChange={(event) => {
              const [exchange, symbol] = event.target.value.split(":");
              setSelection({ exchange, symbol });
            }}
          >
            {options.map((option) => (
              <option
                key={`${option.exchange}-${option.symbol}`}
                value={`${option.exchange}:${option.symbol}`}
              >
                {option.symbol} ({option.exchange})
              </option>
            ))}
          </select>
        </div>
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prediction.projectedSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="horizon" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel chart-span">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Recent trend</span>
            <h3>Historical path leading into forecast</h3>
          </div>
        </div>
        <TrendChart data={prediction.history} />
      </section>

      <section className="panel">
        <div className="metric-stack">
          <div className="metric-card">
            <span>Support</span>
            <strong>{prediction.support}</strong>
          </div>
          <div className="metric-card">
            <span>Resistance</span>
            <strong>{prediction.resistance}</strong>
          </div>
          <div className="metric-card">
            <span>Direction</span>
            <strong>{prediction.direction}</strong>
          </div>
          <div className="metric-card">
            <span>Confidence</span>
            <strong>{prediction.confidence}</strong>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Prediction drivers</span>
            <h3>What is influencing the forecast</h3>
          </div>
        </div>
        <div className="alert-list">
          {prediction.keyDrivers.map((driver, index) => (
            <div key={index} className="alert-item market">
              <span>{driver}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
