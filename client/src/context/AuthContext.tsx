'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('educontrol_token') : null;
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('educontrol_user') : null;
        const wasManualLogout = typeof window !== 'undefined' ? sessionStorage.getItem('educontrol_manual_logout') : null;

        if (savedToken && savedUser) {
          try {
            if (isMounted) {
              setToken(savedToken);
              setUser(JSON.parse(savedUser));
            }
          } catch (e) {
            localStorage.removeItem('educontrol_token');
            localStorage.removeItem('educontrol_user');
          }
        } else if (!wasManualLogout) {
          // Auto-login default system admin for seamless offline/local experience
          try {
            const data = await api.login('admin@educontrol.com', 'admin123');
            if (isMounted) {
              localStorage.setItem('educontrol_token', data.accessToken);
              localStorage.setItem('educontrol_user', JSON.stringify(data.user));
              setToken(data.accessToken);
              setUser(data.user);
            }
          } catch (loginErr) {
            console.warn('[AuthContext] Auto-login fallback skipped:', loginErr);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Init error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Failsafe timer: force dismiss loading spinner after max 1.2s
    const failsafe = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(failsafe);
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === '/login';
      if (!user && !isLoginPage) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user && isLoginPage) {
        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const redirectUrl = searchParams?.get('redirect') || '/cameras';
        router.push(redirectUrl);
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    sessionStorage.removeItem('educontrol_manual_logout');
    localStorage.setItem('educontrol_token', data.accessToken);
    localStorage.setItem('educontrol_user', JSON.stringify(data.user));
    setToken(data.accessToken);
    setUser(data.user);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const redirectUrl = searchParams?.get('redirect') || '/cameras';
    router.push(redirectUrl);
  };

  const logout = () => {
    sessionStorage.setItem('educontrol_manual_logout', 'true');
    localStorage.removeItem('educontrol_token');
    localStorage.removeItem('educontrol_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
