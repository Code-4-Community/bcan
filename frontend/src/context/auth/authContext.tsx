// src/authContext.tsx

import { useContext, createContext, ReactNode } from 'react';
import { getStore } from '../../external/bcanSatchel/store';
import { setAuthentication } from '../../external/bcanSatchel/actions';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  user: any | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const store = getStore();

  const login = async (username: string, password: string) => {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.access_token) {
      setAuthentication(true, data.user, data.access_token);
    } else {
      alert('Login failed. Please check your credentials.');
    }
  };

  const register = async (username: string, password: string, email: string) => {
    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await response.json();

    if (response.ok) {
      // Automatically log in the user
      await login(username, password);
    } else {
      alert(data.message || 'Registration failed');
    }
  };

  const logout = () => {
    // Clear the store
    setAuthentication(false, null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: store.isAuthenticated,
        user: store.user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};