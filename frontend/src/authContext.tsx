import { useState, useContext, createContext, ReactNode } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  user: string | null;
  session?: string | null;
  requiredAttributes?: string[] | null;
  setNewPassword: (newPassword: string, email?: string) => Promise<void>;  // Add setNewPassword here
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<string | null>(null);
  const [requiredAttributes, setRequiredAttributes] = useState<string[] | null>(null);
  const [user, setUser] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.challenge === 'NEW_PASSWORD_REQUIRED') {
      setSession(data.session);
      setRequiredAttributes(data.requiredAttributes);
      setUser(username);
    } else if (data.access_token) {
      setIsAuthenticated(true);
      setUser(username);
    }
  };

  const setNewPassword = async (newPassword: string, email?: string) => {
    if (!session || !user) {
      alert('Session or username missing. Please try logging in again.');
      return;
    }

    const response = await fetch('http://localhost:3001/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, session, username: user, email }),
    });

    const data = await response.json();
    if (data.access_token) {
      setIsAuthenticated(true);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, session, login, setNewPassword, user, requiredAttributes }}>
      {children}
    </AuthContext.Provider>
  );
};