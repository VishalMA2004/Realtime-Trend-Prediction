import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await authenticate("login", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <span className="eyebrow">PulseTrade AI</span>
        <h1>Trade the market with realtime conviction.</h1>
        <p>
          Monitor saved stocks, scan gainers and losers, read AI predictions, and respond to market
          shifts with a live assistant.
        </p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p>Use your email and password to access the trading intelligence dashboard.</p>
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        {error ? <div className="form-error">{error}</div> : null}
        <button type="submit" className="primary-button">
          Login
        </button>
        <span className="auth-switch">
          New user? <Link to="/signup">Create account</Link>
        </span>
      </form>
    </div>
  );
}
