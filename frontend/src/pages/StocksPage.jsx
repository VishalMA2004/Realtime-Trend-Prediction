import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import client from "../api/client";

export default function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [savedSymbols, setSavedSymbols] = useState([]);
  const [message, setMessage] = useState("");
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    client.get("/stocks").then(({ data }) => {
      setStocks(data.stocks);
      setSavedSymbols(
        data.savedStocks?.filter((stock) => stock.exchange === "GLOBAL").map((stock) => stock.symbol) || []
      );
      setMeta(data.meta);
    });
  }, []);

  const saveStock = async (symbol) => {
    try {
      await client.post("/stocks/saved", { symbol, exchange: "GLOBAL" });
      setSavedSymbols((current) => [...new Set([...current, symbol])]);
      setMessage(`${symbol} has been added to your saved realtime watchlist.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save stock.");
    }
  };

  const removeStock = async (symbol) => {
    try {
      await client.delete(`/stocks/saved/${symbol}`, { params: { exchange: "GLOBAL" } });
      setSavedSymbols((current) => current.filter((item) => item !== symbol));
      setMessage(`${symbol} has been removed from your saved watchlist.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to remove stock.");
    }
  };

  return (
    <div className="page-grid single-column">
      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Stock discovery</span>
            <h3>Add stocks to your live prediction workspace</h3>
          </div>
        </div>
        <div className="meta-line">
          Market feed: {meta?.source || "simulated"} • Realtime prediction updates continue even if the
          provider is temporarily unavailable.
        </div>
        {message ? <div className="banner-info">{message}</div> : null}
        <div className="discover-grid">
          {stocks.map((stock) => (
            <article key={stock.symbol} className="discover-card">
              <div className="discover-top">
                <div>
                  <span className="sector-tag">{stock.sector}</span>
                  <h4>{stock.symbol}</h4>
                  <p>{stock.name}</p>
                </div>
                {savedSymbols.includes(stock.symbol) ? (
                  <button className="icon-button" onClick={() => removeStock(stock.symbol)}>
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button className="icon-button" onClick={() => saveStock(stock.symbol)}>
                    <Plus size={16} />
                  </button>
                )}
              </div>
              <div className="discover-metrics">
                <div>
                  <span>Price</span>
                  <strong>{stock.price}</strong>
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
              <div className="discover-footer">
                <span>{stock.outlook}</span>
                <small>Projected {stock.projectedPrice}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
