import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "../api/client";

export default function AnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedStocks, setSavedStocks] = useState([]);
  const [form, setForm] = useState({
    symbol: searchParams.get("symbol") || "NVDA",
    exchange: searchParams.get("exchange") || "GLOBAL",
    amount: 10000,
    years: 1
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    client
      .get("/stocks/saved")
      .then(({ data }) => setSavedStocks(data.stocks))
      .catch(() => setSavedStocks([]));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSearchParams({ symbol: form.symbol, exchange: form.exchange });
    const { data } = await client.post("/stocks/analysis", form);
    setResult(data);
  };

  const options = [
    { symbol: form.symbol, exchange: form.exchange, label: `${form.symbol} (${form.exchange})` },
    { symbol: "NVDA", exchange: "GLOBAL", label: "NVDA (Global)" },
    { symbol: "AAPL", exchange: "GLOBAL", label: "AAPL (Global)" },
    { symbol: "MSFT", exchange: "GLOBAL", label: "MSFT (Global)" },
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
      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Investment analysis</span>
            <h3>Estimate how many stocks to buy and expected profit</h3>
          </div>
        </div>
        <form className="analysis-form" onSubmit={handleSubmit}>
          <label>
            Stock
            <select
              value={`${form.exchange}:${form.symbol}`}
              onChange={(event) => {
                const [exchange, symbol] = event.target.value.split(":");
                setForm({ ...form, exchange, symbol });
              }}
            >
              {options.map((option) => (
                <option key={`${option.exchange}-${option.symbol}`} value={`${option.exchange}:${option.symbol}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount to invest
            <input
              type="number"
              min="100"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
            />
          </label>
          <label>
            Holding period in years
            <input
              type="number"
              min="1"
              max="10"
              value={form.years}
              onChange={(event) => setForm({ ...form, years: Number(event.target.value) })}
            />
          </label>
          <button type="submit" className="primary-button">
            Run analysis
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Projected outcome</span>
            <h3>AI-guided entry plan</h3>
          </div>
        </div>
        {result ? (
          <div className="analysis-result">
            <div className="metric-card">
              <span>Shares to buy</span>
              <strong>{result.shares}</strong>
            </div>
            <div className="metric-card">
              <span>Capital deployed</span>
              <strong>{result.invested}</strong>
            </div>
            <div className="metric-card">
              <span>Projected value</span>
              <strong>{result.projectedValue}</strong>
            </div>
            <div className="metric-card">
              <span>Projected profit</span>
              <strong className={result.projectedProfit >= 0 ? "positive" : "negative"}>
                {result.projectedProfit}
              </strong>
            </div>
            <div className="insight-box">
              <span>Recommendation</span>
              <strong>{result.recommendation}</strong>
              <p>
                Based on current price {result.currentPrice} for {result.symbol} ({result.exchange}),
                the portfolio model estimates future value after the chosen holding period.
              </p>
            </div>
          </div>
        ) : (
          <div className="empty-state">Run an analysis to see stock quantity and profit projection.</div>
        )}
      </section>
    </div>
  );
}
