import { useEffect, useState } from "react";
import { Bell, SendHorizontal } from "lucide-react";
import client from "../../api/client";

export default function ChatBotPanel() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Ask me about buy signals, sell alerts, long-term holding ideas, or tomorrow's top 5 picks."
    }
  ]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState({ alerts: [], topPicks: [], marketStatus: null });

  useEffect(() => {
    client
      .get("/bot/context")
      .then(({ data }) => setContext(data))
      .catch(() => null);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!input.trim()) {
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages((current) => [...current, userMessage]);

    try {
      const { data } = await client.post("/bot/chat", { message: input });
      setMessages((current) => [...current, { role: "bot", content: data.reply }]);
      setContext((current) => ({
        ...current,
        alerts: data.alerts,
        topPicks: data.suggestions
      }));
    } catch (_error) {
      setMessages((current) => [
        ...current,
        { role: "bot", content: "The bot is temporarily unavailable. Please try again." }
      ]);
    }

    setInput("");
  };

  return (
    <aside className="bot-panel">
      <div className="bot-header">
        <div>
          <span className="eyebrow">Realtime bot</span>
          <h3>Trade Assistant</h3>
        </div>
        <Bell size={18} />
      </div>

      <div className="bot-market-status">
        <strong>{context.marketStatus?.state?.replace("_", " ") || "LIVE WATCH"}</strong>
        <span>{context.marketStatus?.message || "Tracking the market and generating alerts."}</span>
      </div>

      <div className="bot-alerts">
        {context.alerts.slice(0, 3).map((alert) => (
          <div key={alert.id} className={`alert-chip ${alert.type}`}>
            {alert.message}
          </div>
        ))}
      </div>

      <div className="chat-thread">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
            {message.content}
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about stocks, trend signals, or tomorrow's ideas..."
        />
        <button type="submit">
          <SendHorizontal size={16} />
        </button>
      </form>
    </aside>
  );
}
