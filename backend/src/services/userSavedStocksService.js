import { getPool } from "../config/db.js";

let ensured = false;

export const ensureSavedStocksSchema = async () => {
  if (ensured) {
    return;
  }

  const pool = getPool();
  const [columns] = await pool.query("SHOW COLUMNS FROM user_saved_stocks LIKE 'exchange'");

  if (!columns.length) {
    await pool.query(
      "ALTER TABLE user_saved_stocks ADD COLUMN exchange VARCHAR(12) NOT NULL DEFAULT 'GLOBAL' AFTER user_id"
    );
    await pool.query("ALTER TABLE user_saved_stocks DROP INDEX unique_saved_stock");
    await pool.query(
      "ALTER TABLE user_saved_stocks ADD UNIQUE KEY unique_saved_stock (user_id, exchange, symbol)"
    );
  }

  ensured = true;
};

export const getSavedStocks = async (userId) => {
  await ensureSavedStocksSchema();
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT symbol, exchange FROM user_saved_stocks WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};
