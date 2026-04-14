import mysql from "mysql2/promise";
import { env } from "./env.js";

let pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: env.mysqlHost,
      port: env.mysqlPort,
      user: env.mysqlUser,
      password: env.mysqlPassword,
      database: env.mysqlDatabase,
      waitForConnections: true,
      connectionLimit: 10
    });
  }

  return pool;
};
