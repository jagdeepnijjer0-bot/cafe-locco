import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

type AuthValue = ReturnType<typeof useAuth> & { isLoggedIn: boolean };

const AuthContext = createContext<AuthValue | null>(null);

/** App-wide auth state, backed by the reused Supabase useAuth hook. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const value: AuthValue = { ...auth, isLoggedIn: auth.isAuthenticated };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
