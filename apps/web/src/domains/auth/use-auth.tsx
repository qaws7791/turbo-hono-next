import React, { createContext, useContext, useEffect, useState } from "react";

import { api } from "@/api/http-client";

interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state on app load
  useEffect(() => {
    // Validate token with your API
    api.auth
      .me()
      .then((response) => response.data)
      .then((userData) => {
        if (!userData) {
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        setUser({
          id: userData.id,
          username: userData.name,
          email: userData.email,
        });
        setIsAuthenticated(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const login = (email: string, password: string) => {
    return api.auth.login(email, password).then((response) => {
      if (!response.data) {
        throw new Error("Login failed");
      }
      setUser({
        id: response.data.user.id,
        username: response.data.user.name,
        email: response.data.user.email,
      });
      setIsAuthenticated(true);
    });
  };

  const logout = () => {
    api.auth.logout().finally(() => {
      setUser(null);
      setIsAuthenticated(false);
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
