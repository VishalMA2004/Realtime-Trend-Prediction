import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await authenticate("register", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <span className="eyebrow">Account Setup</span>
        <h1>Create a professional stock intelligence workspace.</h1>
        <p>
          Sign up to save stocks, receive live alerts, chat with the analysis bot, and review
          historical trend projections.
        </p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <p>Create a new user and store your profile in the MySQL database.</p>
        <input
          type="text"
          placeholder="Full name"
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
        />
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
          Create account
        </button>
        <span className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </span>
      </form>
    </div>
  );
}
