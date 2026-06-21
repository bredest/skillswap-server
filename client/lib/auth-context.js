'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchApi(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken) => {
    try {
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${API_URL}/auth/session`, {
        headers,
        credentials: 'include',
      });
      const data = await res.json();

      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { user, token } = data;
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    return user;
  };

  const register = async (name, email, password, image, role) => {
    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, image, role }),
    });
    const { user, token } = data;
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    return user;
  };

  const googleLogin = async (googleUserData) => {
    const data = await fetchApi('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleUserData),
    });
    const { user, token } = data;
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    return user;
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const refreshUser = () => {
    if (token) {
      fetchUser(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, refreshUser, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { fetchApi, API_URL };
