import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const roleToPath = {
  Admin: "/admin",
  Manager: "/manager",
  Employee: "/employee"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const hydrateUser = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      setUser(response.data.data);
      setToken(storedToken);
    } catch (error) {
      if (localStorage.getItem("token") === storedToken) {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateUser();
  }, []);

  useEffect(() => {
    const onExpired = () => clearAuth();
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const nextToken = response.data.data.token;
    const nextUser = response.data.data.user;

    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });
    const nextToken = response.data.data.token;
    const nextUser = response.data.data.user;

    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Client-side cleanup still runs even if server logout fails.
    } finally {
      clearAuth();
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      clearAuth,
      defaultPath: user ? roleToPath[user.role] || "/login" : "/login"
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
