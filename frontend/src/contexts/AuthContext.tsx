/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import type { AuthContextType, User } from '../types/auth';
import { AuthService } from '../services/auth.service';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        try {
          const { user: userData } = await AuthService.getMe(savedToken);
          setUser(userData);
          setToken(savedToken);
        } catch {
          // Invalid token, clear it
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (name: string, pin: string) => {
    const response = await AuthService.login({ name, pin });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(TOKEN_KEY, response.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
