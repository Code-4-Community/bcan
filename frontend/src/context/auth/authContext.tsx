import { useContext, createContext, ReactNode, useEffect } from 'react';
import { getAppStore } from '../../external/bcanSatchel/store';
import { setAuthState, logoutUser } from '../../external/bcanSatchel/actions';
import { observer } from 'mobx-react-lite';
import { User } from '../../../../middle-layer/types/User';
import { api } from '../../api';

/**
 * Available authenticated user options
 */
interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/** Provides user with authenticated action options based on above props */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = observer(({ children }: { children: ReactNode }) => {
  const store = getAppStore();

  /** Attempt to log in the user */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setAuthState(true, data.user, null);
        return true;
      } else {
        console.warn('Login failed:', data.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

   /**
   * Register a new user and automatically log them in
   */
   const register = async (username: string, password: string, email: string) => {
    
    const response = await api('/auth/register', {
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


  /** Log out the user */
  const logout = () => {
    api('/auth/logout', { method: 'POST' });
    logoutUser();
  };

  /** Restore user session on refresh */
  useEffect(() => {
    api('/auth/session')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(({ user }) => setAuthState(true, user, null))
      .catch(() => logoutUser());
  }, []);

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
