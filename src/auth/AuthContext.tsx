"use client";

import React from "react";
import { api } from "@/services/backend";
import { USE_PHP_API } from "@/services/appMode";

export type Student = {
  id: number;
  first_name: string;
  last_name: string;
  level_id: number;
  class_id: number;
  level_code: string;
  class_code: string;
  class_name: string;
};

export type Parent = {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string | null;
  gsm: string | null;
  cin?: string | null;
  home_phone?: string | null;
  address?: string | null;
};

type AuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  parent: Parent | null;
  students: Student[];
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

export const AUTH_STORAGE_KEY = "alhanane_auth_v1";

const AuthContext = React.createContext<AuthState | null>(null);

export function getStoredAuth(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeStoredAuth(value: boolean) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, value ? "true" : "false");
  } catch {
    // ignore
  }
}

// Mode simulation (Dyad) : on garde des comptes locaux.
// En production, login passe via l'API PHP.
const DEMO_ACCOUNTS: Array<{ login: string; password: string }> = [
  { login: "parent.pere", password: "123456" },
  { login: "parent.mere", password: "123456" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [parent, setParent] = React.useState<Parent | null>(null);
  const [students, setStudents] = React.useState<Student[]>([]);

  const refreshMe = React.useCallback(async () => {
    if (!USE_PHP_API) return;

    try {
      const res = await api.get<{ parent: Parent; students: Student[] }>("/auth/me.php");
      if (res.success) {
        setParent(res.data.parent);
        setStudents(res.data.students ?? []);
        writeStoredAuth(true);
        setIsAuthenticated(true);
      } else {
        setParent(null);
        setStudents([]);
        writeStoredAuth(false);
        setIsAuthenticated(false);
      }
    } catch {
      // Non connecté (401) ou API inaccessible
      setParent(null);
      setStudents([]);
      writeStoredAuth(false);
      setIsAuthenticated(false);
    }
  }, []);

  React.useEffect(() => {
    // Si on est en API, on tente de restaurer la session serveur.
    // Sinon, fallback sur la persistance locale.
    (async () => {
      if (USE_PHP_API) {
        await refreshMe();
        setLoading(false);
        return;
      }

      setIsAuthenticated(getStoredAuth());
      setLoading(false);
    })();
  }, [refreshMe]);

  const login = React.useCallback(
    async (login: string, password: string) => {
      const l = login.trim();
      const p = password.trim();

      if (!USE_PHP_API) {
        const ok = DEMO_ACCOUNTS.some((a) => a.login === l && a.password === p);
        if (ok) {
          writeStoredAuth(true);
          setIsAuthenticated(true);
          return true;
        }
        return false;
      }

      try {
        const res = await api.post<{ parent: Parent }>("/auth/login.php", { login: l, password: p });
        if (!res.success) return false;

        // Session créée côté serveur, puis on récupère parent+students.
        await refreshMe();
        return true;
      } catch {
        return false;
      }
    },
    [refreshMe]
  );

  const logout = React.useCallback(async () => {
    if (USE_PHP_API) {
      try {
        await api.post("/auth/logout.php", {});
      } catch {
        // ignore
      }
    }

    setParent(null);
    setStudents([]);
    setIsAuthenticated(false);
    writeStoredAuth(false);
  }, []);

  const value = React.useMemo(
    () => ({ isAuthenticated, loading, parent, students, login, logout, refreshMe }),
    [isAuthenticated, loading, parent, students, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}