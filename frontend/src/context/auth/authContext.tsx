import { useContext, createContext, ReactNode, useEffect } from 'react';
import { getAppStore } from '../../external/bcanSatchel/store';
import { setAuthState, logoutUser } from '../../external/bcanSatchel/actions'
import { observer } from 'mobx-react-lite';

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

export const AuthProvider = observer(({ children }: { children: ReactNode }) => {
  const store = getAppStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3001/auth/me', {
          method: 'POST',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        const data = await response.json();
        setAuthState(true, data.user, null); 
      } catch (err) {
        // Not logged in or token invalid
        logoutUser();
      }
    };
    checkSession();
  }, []);

  /**
   * Attempt to log in the user
   */
  const login = async (username: string, password: string) => {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    const data = await response.json();
    if (data.user) {
      setAuthState(true, data.user, null);
    } else {
      alert('Login failed. Please check your credentials.');
    }
  };

  /**
   * Register a new user and automatically log them in
   */
  const register = async (username: string, password: string, email: string) => {
    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await response.json();
    if (response.ok) {
      // log the user in after registration
      await login(username, password);
    } else {
      alert(data.message || 'Registration failed');
    }
  };

  /**
   * Log out the user
   */
  const logout = async () => {
  // 1) Clear server backed credentials
  await fetch('http://localhost:3001/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  // 2) Clear local store
  logoutUser(); 
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
});