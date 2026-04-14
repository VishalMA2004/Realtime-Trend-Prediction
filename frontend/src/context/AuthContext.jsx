import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("pulseTradeUser");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("pulseTradeUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("pulseTradeUser");
    }
  }, [user]);

  const authenticate = async (mode, payload) => {
    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const { data } = await client.post(endpoint, payload);
    localStorage.setItem("pulseTradeToken", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("pulseTradeToken");
    localStorage.removeItem("pulseTradeUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
