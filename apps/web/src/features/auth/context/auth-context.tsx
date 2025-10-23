import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { AuthContextValue, AuthUser } from "@/features/auth/types";

import {
  fetchCurrentUser,
  login,
  logout,
} from "@/features/auth/api/auth-service";

const AuthContext = createContext<AuthContextValue | null>(null);

const defaultFallback = (
  <div className="flex min-h-screen items-center justify-center">
    Loading...
  </div>
);

export interface AuthProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthProvider({
  children,
  fallback = defaultFallback,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const currentUser = await fetchCurrentUser();
        if (!isMounted) return;
        setUser(currentUser);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const authenticatedUser = await login(email, password);
    setUser(authenticatedUser);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isLoading,
      user,
      login: handleLogin,
      logout: handleLogout,
    }),
    [handleLogin, handleLogout, isLoading, user],
  );

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
}
