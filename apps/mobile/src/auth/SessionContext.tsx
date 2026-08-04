import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch, setAuthToken } from '../api/client';
import { tokenStorage } from './storage';
import type { Role, User } from '../types/api';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, 'admin'>;
  phone?: string;
};

type SessionContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await tokenStorage.get();
      if (token) {
        setAuthToken(token);
        try {
          setUser(await apiFetch<User>('/me'));
        } catch {
          await tokenStorage.remove();
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiFetch<{ user: User; token: string }>('/login', {
      method: 'POST',
      body: { email, password },
    });
    await tokenStorage.set(result.token);
    setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await apiFetch<{ user: User; token: string }>('/register', {
      method: 'POST',
      body: input,
    });
    await tokenStorage.set(result.token);
    setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch {
      // Clear local session regardless of whether the network call succeeded.
    }
    await tokenStorage.remove();
    setAuthToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await apiFetch<User>('/me'));
  }, []);

  return (
    <SessionContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
