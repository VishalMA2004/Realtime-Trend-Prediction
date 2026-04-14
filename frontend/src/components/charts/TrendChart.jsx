import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function TrendChart({ data, color = "#22c55e", dataKey = "price", secondaryKey = "prediction" }) {
  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
          <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill="url(#trendFill)" strokeWidth={3} />
          {secondaryKey ? (
            <Area type="monotone" dataKey={secondaryKey} stroke="#f59e0b" fillOpacity={0} strokeWidth={2} />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
