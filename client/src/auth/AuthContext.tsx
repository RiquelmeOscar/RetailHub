import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api/client";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "operator";
}

const AuthContext = createContext<{ user: User | null; login: (e: string, p: string) => Promise<void>; logout: () => void }>({
  user: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (getToken()) {
      api<User>("/auth/me").then(setUser).catch(() => setToken(null));
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    setUser(res.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
