import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { login as apiLogin, register as apiRegister, me as apiMe, logout as apiLogout } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("archiw_token") || null);

  const checkAuth = useCallback(async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await apiMe();
      setUser(data);
    } catch {
      localStorage.removeItem("archiw_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginWithPassword = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem("archiw_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerWithPassword = async (name, email, password) => {
    const data = await apiRegister(name, email, password);
    localStorage.setItem("archiw_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {}

    localStorage.removeItem("archiw_token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      token,
      loginWithPassword,
      registerWithPassword,
      logout,
    }),
    [user, loading, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
