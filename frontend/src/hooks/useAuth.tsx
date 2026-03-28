import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = (import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')).replace(/\/$/, '');
const API = `${API_BASE}/auth`;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'architect';
  avatar?: string | null;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Bootstrap: restore session from localStorage ──
  useEffect(() => {
    const storedToken = localStorage.getItem('prepai_token');
    const storedUser  = localStorage.getItem('prepai_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Silently verify token is still valid with the server
        fetch(`${API}/me`, { headers: { Authorization: `Bearer ${storedToken}` } })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data) {
              setUser(data);
              localStorage.setItem('prepai_user', JSON.stringify(data));
            } else {
              // Token expired / invalid
              _clear();
            }
          })
          .catch(() => { /* offline – keep cached user */ });
      } catch {
        _clear();
      }
    }
    setIsLoading(false);
  }, []);

  function _persist(u: User, t: string) {
    setUser(u);
    setToken(t);
    localStorage.setItem('prepai_token', t);
    localStorage.setItem('prepai_user', JSON.stringify(u));
  }

  function _clear() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('prepai_token');
    localStorage.removeItem('prepai_user');
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Login failed.' };
      _persist(data.user, data.token);
      return { success: true };
    } catch {
      return { success: false, message: 'Cannot connect to server. Make sure the backend is running.' };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Signup failed.' };
      _persist(data.user, data.token);
      return { success: true };
    } catch {
      return { success: false, message: 'Cannot connect to server. Make sure the backend is running.' };
    }
  }, []);

  const logout = useCallback(() => {
    _clear();
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('prepai_user', JSON.stringify(updated));
      return updated;
    });

    const storedToken = localStorage.getItem('prepai_token');
    if (storedToken) {
      try {
        const res = await fetch(`${API}/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${storedToken}`
          },
          body: JSON.stringify(data)
        });
        if (res.ok) {
           const updatedServerUser = await res.json();
           setUser(updatedServerUser);
           localStorage.setItem('prepai_user', JSON.stringify(updatedServerUser));
        }
      } catch (err) {
        console.error('Failed to sync profile update to server', err);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
