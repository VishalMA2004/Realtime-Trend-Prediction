import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import StocksPage from "./pages/StocksPage";
import HistoryPage from "./pages/HistoryPage";
import AnalysisPage from "./pages/AnalysisPage";
import ExchangePage from "./pages/ExchangePage";
import PredictionPage from "./pages/PredictionPage";
import AppShell from "./components/layout/AppShell";

const ProtectedRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/nse" element={<ExchangePage exchange="NSE" />} />
        <Route path="/bse" element={<ExchangePage exchange="BSE" />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </AppShell>
  );
};

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUpPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}
