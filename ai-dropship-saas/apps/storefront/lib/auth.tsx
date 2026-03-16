'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, type User } from './api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setLoading(false); return; }

    api.me()
      .then(setUser)
      .catch(() => {
        // Token expired — try refresh
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) { clearTokens(); setLoading(false); return; }
        api.refresh(refresh)
          .then(r => {
            storeTokens(r.access_token, r.refresh_token);
            return api.me();
          })
          .then(setUser)
          .catch(() => clearTokens())
          .finally(() => setLoading(false));
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.login(email, password);
    storeTokens(r.access_token, r.refresh_token);
    const u = await api.me();
    setUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const r = await api.register(name, email, password);
    storeTokens(r.access_token, r.refresh_token);
    const u = await api.me();
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token') ?? '';
    await api.logout(refresh).catch(() => {});
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

function storeTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
