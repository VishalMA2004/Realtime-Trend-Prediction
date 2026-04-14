import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  mysqlHost: process.env.MYSQL_HOST || "localhost",
  mysqlPort: Number(process.env.MYSQL_PORT || 3306),
  mysqlUser: process.env.MYSQL_USER || "root",
  mysqlPassword: process.env.MYSQL_PASSWORD || "",
  mysqlDatabase: process.env.MYSQL_DATABASE || "stock_predictor",
  marketDataProvider: process.env.MARKET_DATA_PROVIDER || "twelve-data",
  twelveDataApiKey: process.env.TWELVE_DATA_API_KEY || "",
  marketRefreshMs: Number(process.env.MARKET_REFRESH_MS || 60000),
  marketTickMs: Number(process.env.MARKET_TICK_MS || 5000)
};
