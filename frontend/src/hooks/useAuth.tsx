import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AuthUser, UserProfile, UserType } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, type: UserType, rut?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredToken(): string | null {
  return localStorage.getItem('milocal_token');
}

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('milocal_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const fetchProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      const data = await api.getUser(uid);
      return data;
    } catch {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const stored = getStoredUser();
    if (stored) {
      const p = await fetchProfile(stored.id);
      if (p) {
        setProfile(p);
      } else {
        // Keep profile as null when fetch fails
        setProfile(null);
      }
    }
  }, [fetchProfile]);

  useEffect(() => {
    const init = async () => {
      const stored = getStoredUser();
      if (stored) {
        const p = await fetchProfile(stored.id);
        if (p) {
          setProfile(p);
        } else {
          setProfile(null);
        }
      }
      setIsLoading(false);
    };
    init();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    const token: string = data.token;
    const authUser: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      type: data.user.type as UserType,
      token,
    };

    localStorage.setItem('milocal_token', token);
    localStorage.setItem('milocal_user', JSON.stringify(authUser));
    setUser(authUser);
    await refreshProfile();
  }, [refreshProfile]);

  const register = useCallback(async (name: string, email: string, password: string, type: UserType, rut?: string) => {
    const data = await api.register(name, email, password, type, rut);
    const token: string = data.token;
    const authUser: AuthUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      type: data.user.type as UserType,
      token,
    };

    localStorage.setItem('milocal_token', token);
    localStorage.setItem('milocal_user', JSON.stringify(authUser));
    setUser(authUser);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem('milocal_token');
    localStorage.removeItem('milocal_user');
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback((p: UserProfile) => {
    setProfile(p);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
