import { marketEngine } from "./mockMarketEngine.js";

export const buildBotReply = (message) => {
  const text = message.toLowerCase();
  const snapshot = marketEngine.getSnapshot();
  const strongest = snapshot.recommendations[0];
  const weakest = snapshot.losers[0];

  if (text.includes("buy")) {
    return `Best near-term setup is ${strongest.symbol}. Signal strength is ${strongest.confidence} and the model projects continued momentum.`;
  }

  if (text.includes("sell")) {
    return `${weakest.symbol} is the weakest live setup right now. Tighten stops or reduce exposure if it breaks support.`;
  }

  if (text.includes("long term")) {
    const longTerm = snapshot.stocks.filter((stock) => stock.score >= 70).slice(0, 3);
    return `For longer holding periods, focus on ${longTerm.map((stock) => stock.symbol).join(", ")} because they show strong score, sector momentum, and steady projected trend.`;
  }

  if (text.includes("tomorrow") || text.includes("next day")) {
    return `Top next-session ideas are ${snapshot.recommendations.map((stock) => stock.symbol).join(", ")} based on current momentum, sentiment, and projected continuation.`;
  }

  return `Live market tone is ${snapshot.marketStatus.state.toLowerCase().replace("_", " ")} using ${snapshot.meta.source} market data. ${strongest.symbol} remains the strongest candidate, while ${weakest.symbol} needs caution.`;
};
