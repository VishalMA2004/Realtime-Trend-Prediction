import { BarChart3, Bot, BrainCircuit, Building2, History, LayoutDashboard, LogOut, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ChatBotPanel from "../bot/ChatBotPanel";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stocks", label: "Stocks", icon: Search },
  { to: "/nse", label: "NSE", icon: Building2 },
  { to: "/bse", label: "BSE", icon: Building2 },
  { to: "/history", label: "History", icon: History },
  { to: "/prediction", label: "Prediction", icon: BrainCircuit },
  { to: "/analysis", label: "Analysis", icon: BarChart3 }
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">PulseTrade AI</div>
          <p className="sidebar-tagline">Realtime stock intelligence for confident market action.</p>
          <nav className="sidebar-nav">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user?.fullName?.[0] || "U"}</div>
            <div>
              <strong>{user?.fullName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button className="ghost-button" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-layout">
        <div className="topbar">
          <div>
            <span className="eyebrow">AI market command center</span>
            <h1>Realtime Trend & Prediction Workspace</h1>
          </div>
          <div className="live-pill">
            <Bot size={16} />
            Bot connected
          </div>
        </div>

        <section className="page-content">{children}</section>
      </main>

      <ChatBotPanel />
    </div>
  );
}
