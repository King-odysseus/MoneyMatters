import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import api from "../lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  role: "admin" | "member" | "viewer";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  display_name: string;
  household_name: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me/");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (username: string, password: string) => {
    const { data } = await api.post("/auth/login/", { username, password });
    setUser(data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout/");
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    const { data: res } = await api.post("/auth/register/", data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
