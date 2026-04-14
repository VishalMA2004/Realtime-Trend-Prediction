import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import client from "../api/client";

export default function ExchangePage({ exchange }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    client
      .get(`/stocks/exchange/${exchange}`, {
        params: {
          search,
          page,
          pageSize: 100
        }
      })
      .then(({ data: response }) => setData(response));
  }, [exchange, search, page]);

  useEffect(() => {
    setPage(1);
  }, [exchange]);

  if (!data) {
    return <div className="panel">Loading {exchange} board...</div>;
  }

  const saveStock = async (symbol) => {
    try {
      await client.post("/stocks/saved", { symbol, exchange });
      setData((current) => ({
        ...current,
        savedSymbols: [...new Set([...(current.savedSymbols || []), symbol])]
      }));
      setMessage(`${symbol} was added to your ${exchange} saved watchlist.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save stock.");
    }
  };

  const removeStock = async (symbol) => {
    try {
      await client.delete(`/stocks/saved/${symbol}`, { params: { exchange } });
      setData((current) => ({
        ...current,
        savedSymbols: (current.savedSymbols || []).filter((item) => item !== symbol)
      }));
      setMessage(`${symbol} was removed from your ${exchange} saved watchlist.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to remove stock.");
    }
  };

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">{data.exchange} Exchange</span>
          <h2>
            {data.indexName} {data.indexValue}
          </h2>
          <p>{data.overview}</p>
          <div className="meta-line">
            Source: {data.source} • {data.exchange} results: {data.total}
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card success">
            <div>
              <span>Index</span>
              <strong>{data.indexName}</strong>
            </div>
          </div>
          <div className="stat-card warning">
            <div>
              <span>Top pick</span>
              <strong>{data.topPicks[0]?.symbol}</strong>
            </div>
          </div>
          <div className="stat-card danger">
            <div>
              <span>Weakest setup</span>
              <strong>{data.losers[0]?.symbol}</strong>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <span>Visible stocks</span>
              <strong>{data.stocks.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel chart-span">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Search exchange</span>
            <h3>Browse all {data.exchange} stocks</h3>
          </div>
        </div>
        <div className="exchange-toolbar">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={`Search ${data.exchange} by symbol, name, or ISIN`}
          />
          <div className="meta-line">
            Page {data.page} • Showing up to {data.pageSize} stocks
          </div>
        </div>
      </section>

      {message ? <section className="banner-info chart-span">{message}</section> : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Top gainers</span>
            <h3>{data.exchange} strength board</h3>
          </div>
        </div>
        <div className="stock-list">
          {data.gainers.map((stock) => (
            <div key={stock.symbol} className="stock-row">
              <div>
                <strong>{stock.symbol}</strong>
                <span>{stock.name}</span>
              </div>
              <div className="positive">
                +{stock.change}%<small>{stock.price}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Top losers</span>
            <h3>{data.exchange} weakness board</h3>
          </div>
        </div>
        <div className="stock-list">
          {data.losers.map((stock) => (
            <div key={stock.symbol} className="stock-row">
              <div>
                <strong>{stock.symbol}</strong>
                <span>{stock.name}</span>
              </div>
              <div className="negative">
                {stock.change}%<small>{stock.price}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel chart-span">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Exchange board</span>
            <h3>{data.exchange} tracked stocks</h3>
          </div>
        </div>
        <div className="discover-grid">
          {data.stocks.map((stock) => (
            <article key={stock.symbol} className="discover-card">
              <div className="discover-top">
                <div>
                  <span className="sector-tag">{stock.sector}</span>
                  <h4>{stock.symbol}</h4>
                  <p>{stock.name}</p>
                </div>
                <div className={`signal-pill ${stock.direction === "UP" ? "up" : stock.direction === "DOWN" ? "down" : ""}`}>
                  {stock.direction}
                </div>
              </div>
              <div className="discover-metrics">
                <div>
                  <span>Price</span>
                  <strong>{stock.price || "N/A"}</strong>
                </div>
                <div>
                  <span>Trend</span>
                  <strong className={stock.change >= 0 ? "positive" : "negative"}>{stock.change}%</strong>
                </div>
                <div>
                  <span>AI score</span>
                  <strong>{stock.score}</strong>
                </div>
              </div>
              <div className="exchange-actions">
                {(data.savedSymbols || []).includes(stock.symbol) ? (
                  <button className="icon-button" onClick={() => removeStock(stock.symbol)}>
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button className="icon-button" onClick={() => saveStock(stock.symbol)}>
                    <Plus size={16} />
                  </button>
                )}
                <Link className="ghost-button" to={`/history?symbol=${stock.symbol}&exchange=${exchange}`}>
                  History
                </Link>
                <Link className="ghost-button" to={`/prediction?symbol=${stock.symbol}&exchange=${exchange}`}>
                  Prediction
                </Link>
                <Link className="ghost-button" to={`/analysis?symbol=${stock.symbol}&exchange=${exchange}`}>
                  Analysis
                </Link>
              </div>
              <div className="discover-footer">
                <span>{stock.projectedPrice ? `Projected ${stock.projectedPrice}` : stock.isin || stock.code || stock.exchange}</span>
                <small>{stock.exchange}</small>
              </div>
            </article>
          ))}
        </div>
        <div className="exchange-pager">
          <button
            className="ghost-button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={data.page <= 1}
          >
            Previous
          </button>
          <button
            className="ghost-button"
            onClick={() => setPage((current) => current + 1)}
            disabled={data.page * data.pageSize >= data.total}
          >
            Next
          </button>
        </div>
      </section>

      <section className="panel chart-span">
        <div className="panel-header">
          <div>
            <span className="eyebrow">AI picks</span>
            <h3>Best {data.exchange} ideas</h3>
          </div>
        </div>
        <div className="picks-list picks-inline">
          {data.topPicks.map((stock, index) => (
            <div key={stock.symbol} className="pick-card">
              <span>#{index + 1}</span>
              <strong>{stock.symbol}</strong>
              <p>{stock.name}</p>
              <small>Projected {stock.projectedPrice}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
