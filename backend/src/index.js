import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import botRoutes from "./routes/botRoutes.js";
import { registerSocket } from "./socket/registerSocket.js";
import { marketEngine } from "./services/mockMarketEngine.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true
  }
});

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "PulseTrade AI API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/bot", botRoutes);

registerSocket(io);
marketEngine.connect(io).catch((error) => {
  console.error("Market engine initialization failed:", error.message);
});

server.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
