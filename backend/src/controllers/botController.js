import { getPool } from "../config/db.js";
import { buildBotReply } from "../services/botService.js";
import { marketEngine } from "../services/mockMarketEngine.js";

export const chatWithBot = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required." });
  }

  try {
    const reply = buildBotReply(message);
    const pool = getPool();

    await pool.query("INSERT INTO bot_queries (user_id, user_query, bot_reply) VALUES (?, ?, ?)", [
      req.user.id,
      message,
      reply
    ]);

    return res.json({
      reply,
      suggestions: marketEngine.getNextDayPicks(),
      alerts: marketEngine.getAlerts()
    });
  } catch (error) {
    return res.status(500).json({ message: "Bot failed to respond.", detail: error.message });
  }
};

export const getBotContext = (_req, res) => {
  return res.json({
    alerts: marketEngine.getAlerts(),
    topPicks: marketEngine.getNextDayPicks(),
    marketStatus: marketEngine.getSnapshot().marketStatus
  });
};
