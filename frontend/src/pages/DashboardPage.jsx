import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BellRing, TrendingUp } from "lucide-react";
import client from "../api/client";
import TrendChart from "../components/charts/TrendChart";
import { useMarketSocket } from "../hooks/useMarketSocket";

const StatCard = ({ label, value, tone = "neutral", icon: Icon }) => (
  <div className={`stat-card ${tone}`}>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
    <Icon size={20} />
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const { snapshot, alerts } = useMarketSocket();

  useEffect(() => {
    client.get("/stocks/dashboard").then(({ data: response }) => setData(response));
  }, []);

  useEffect(() => {
    if (snapshot) {
      setData((current) => ({ ...(current || {}), ...snapshot, alerts }));
    }
  }, [snapshot, alerts]);

  const featured = data?.savedStocks?.[0] || data?.stocks?.[0];

  if (!data) {
    return <div className="panel">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-grid">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Live market intelligence</span>
          <h2>{data.marketStatus.message}</h2>
          <p>
            Realtime prediction is blending historical trend, current sentiment, and projected
            momentum to surface buy and sell opportunities.
          </p>
          <div className="meta-line">
            Source: {data.meta?.source || "simulated"} • Last update:{" "}
            {data.meta?.lastUpdated ? new Date(data.meta.lastUpdated).toLocaleString() : "now"}
          </div>
        </div>
        <div className="hero-stats">
          <StatCard label="Saved stocks" value={data.savedStocks.length} icon={TrendingUp} />
          <StatCard label="Top gainer" value={data.gainers[0]?.symbol || "--"} tone="success" icon={ArrowUpRight} />
          <StatCard label="Top loser" value={data.losers[0]?.symbol || "--"} tone="danger" icon={ArrowDownRight} />
          <StatCard label="Live alerts" value={data.alerts?.length || 0} tone="warning" icon={BellRing} />
        </div>
      </section>

      <section className="panel chart-span">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Realtime saved stock trend</span>
            <h3>
              {featured?.symbol || "No saved stock yet"} projected toward {featured?.projectedPrice || "--"}
            </h3>
            {featured?.exchange ? <div className="meta-line">Watchlist source: {featured.exchange}</div> : null}
          </div>
          <div className={`signal-pill ${featured?.score >= 70 ? "up" : featured?.score <= 50 ? "down" : ""}`}>
            {featured?.direction || "UP"}
          </div>
        </div>
        {featured ? (
          <TrendChart data={featured.history || []} />
        ) : (
          <div className="empty-state">Add a stock from the Stocks page to start live tracking here.</div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Market gainers</span>
            <h3>Momentum leaders</h3>
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
            <span className="eyebrow">Market losers</span>
            <h3>Risk watchlist</h3>
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

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Realtime alerts</span>
            <h3>Open, close, buy, and sell notifications</h3>
          </div>
        </div>
        <div className="alert-list">
          {(data.alerts || []).map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.type}`}>
              <strong>{alert.type.toUpperCase()}</strong>
              <span>{alert.message}</span>
              <small>{alert.time}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Tomorrow's top 5</span>
            <h3>Bot-generated next day stock ideas</h3>
          </div>
        </div>
        <div className="picks-list">
          {data.recommendations.map((pick) => (
            <div key={pick.symbol} className="pick-card">
              <span>#{pick.rank}</span>
              <strong>{pick.symbol}</strong>
              <p>{pick.reason}</p>
              <small>{pick.confidence}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
