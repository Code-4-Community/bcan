import { useContext, createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { getAppStore } from '../../external/bcanSatchel/store';
import { setAuthState, logoutUser } from '../../external/bcanSatchel/actions';
import { observer } from 'mobx-react-lite';
import { User } from '../../../../middle-layer/types/User';
import { api, COOKIE_MISSING_EVENT } from '../../api';
import { fetchUsers } from '../../main-page/users/UserActions.ts';
import Button from '../../components/Button';


/**
 * Available authenticated user options
 */
interface AuthContextProps {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (password: string, email: string, firstName: string, lastName:string) => Promise<{ state: boolean; message: string; }>;
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
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCookieErrorPrompt, setShowCookieErrorPrompt] = useState(false);
  // Auto-logout timeout duration (in milliseconds)
  // 8 hours = 8 * 60 * 60 * 1000
  const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;

  /** Attempt to log in the user */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.user) {
        console.log("Login successful:", data.user);
        setAuthState(true, data.user, null);
        await fetchUsers();
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
   const register = async ( password: string, email: string, firstName :string, lastName:string): Promise<{ state: boolean; message: string; }>=> {
    try {
      const response = await api('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, email,firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        const loggedIn = await login(email, password);
        if (loggedIn) return {state: true, message: ''};
        console.warn('User registered but auto-login failed');
        return {state: false, message: 'User registered but auto-login failed'};
      }

      if (response.status === 409 || data.message?.includes('exists')) {
        //alert('An account with this username or email already exists.');
              return {state: false, message: 'An account with this email already exists.'}
      } else if (response.status === 400) {
        //alert(data.message || 'Invalid registration details.');
              return {state: false, message: 'Invalid registration details. ' + (data.message || '')}
      } else {
        //alert('Registration failed. Please try again later.');
              return {state: false, message: 'Please try again later.'}
      }
    } catch (error) {
      console.error('Error during registration:', error);
      //alert('An unexpected error occurred. Please try again later.');
      return {state: false, message: 'An unexpected error occurred. Please try again later.'}
    }
  };



  /** Log out the user */
  const logout = () => {
    api('/auth/logout', { method: 'POST' });
    logoutUser();
    // Clear the logout timer when user manually logs out
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  /** Start the auto-logout timer (8 hours from now) */
  useEffect(() => {
    if (!store.isAuthenticated) {
      // Clear timer if user is not authenticated
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      return;
    }

    // Start the 8-hour timer when user logs in
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);

    // Cleanup: clear timer on unmount or logout
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, [store.isAuthenticated]);

  useEffect(() => {
    const onCookieMissing = () => {
      if (store.isAuthenticated) {
        setShowCookieErrorPrompt(true);
      }
    };

    window.addEventListener(COOKIE_MISSING_EVENT, onCookieMissing);

    return () => {
      window.removeEventListener(COOKIE_MISSING_EVENT, onCookieMissing);
    };
  }, [store.isAuthenticated]);

  useEffect(() => {
    if (!store.isAuthenticated && showCookieErrorPrompt) {
      setShowCookieErrorPrompt(false);
    }
  }, [showCookieErrorPrompt, store.isAuthenticated]);

  /** Restore user session on refresh */
  // useEffect(() => {
  //   api('/auth/session')
  //     .then(r => (r.ok ? r.json() : Promise.reject()))
  //     .then(({ user }) => setAuthState(true, user, null))
  //     .catch(() => logoutUser());
  // }, []);

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
      {showCookieErrorPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md px-8 py-6 max-w-md mx-4 text-center">
            <h3 className="text-xl font-bold mb-2">Internal Error</h3>
            <p className="mb-4">
              An internal error occurred and your session could not be verified.
              Please log out and log back in.
            </p>
            <Button
              text="Logout"
              onClick={logout}
              className="text-white bg-primary-900 mx-auto"
            />
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
});
