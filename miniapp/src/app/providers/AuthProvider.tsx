import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserMe } from "../../types/user";
import { loginApi, meApi, registerApi } from "../../api/auth";

const LS_KEY = "ol_access_token";

type AuthContextValue = {
  token: string | null;
  user: UserMe | null;
  loading: boolean;
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_KEY);
  };

  const refreshMe = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await meApi(token);
      setUser(me);
    } catch (e: any) {
      // токен мог истечь/быть невалидным
      logout();
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setToken(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    // при изменении токена — подтягиваем /me
    if (!token) {
      setUser(null);
      return;
    }
    localStorage.setItem(LS_KEY, token);
    void refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    setToken(res.access_token);
  };

  const register = async (email: string, password: string) => {
    await registerApi({ email, password });
    // учебно: после регистрации сразу логинимся
    await login(email, password);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      isAuthed: !!token,
      login,
      register,
      logout,
      refreshMe,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
