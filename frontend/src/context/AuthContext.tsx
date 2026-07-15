import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: { id: string; title: string; addressLine: string; instructions?: string }[];
  favorites: { restaurants: string[]; dishes: string[] };
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  theme: 'light' | 'dark';
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, passwordHash: string, address?: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  logout: () => void;
  toggleTheme: () => void;
  addAddress: (title: string, addressLine: string, instructions?: string) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  toggleFavorite: (type: 'restaurant' | 'dish', id: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load user and theme on startup
  useEffect(() => {
    // 1. Theme Configuration
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (userPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // 2. Fetch User if Token is Present
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Failed to fetch user profiles, clearing session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, phone: string, passwordHash: string, address?: string) => {
    const data = await api.register({ name, email, phone, password: passwordHash, address });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const loginWithOtp = async (phone: string, otp: string) => {
    const data = await api.verifyOtp(phone, otp);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const requestOtp = async (phone: string) => {
    await api.requestOtp(phone);
  };

  const loginWithGoogle = async (code: string) => {
    const data = await api.googleLogin(code);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const addAddress = async (title: string, addressLine: string, instructions?: string) => {
    const response = await api.addAddress({ title, addressLine, instructions });
    if (user) {
      setUser({ ...user, addresses: response.addresses });
    }
  };

  const deleteAddress = async (id: string) => {
    const response = await api.deleteAddress(id);
    if (user) {
      setUser({ ...user, addresses: response.addresses });
    }
  };

  const toggleFavorite = async (type: 'restaurant' | 'dish', id: string) => {
    const response = await api.toggleFavorite(type, id);
    if (user) {
      setUser({ ...user, favorites: response.favorites });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      theme,
      login,
      register,
      loginWithOtp,
      requestOtp,
      logout,
      toggleTheme,
      addAddress,
      deleteAddress,
      toggleFavorite,
      loginWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
