import { createStore } from 'satcheljs';

export interface User {
  userId: string;
  email: string;
  biography: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
}

// Define initial state
const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
};

const store = createStore<AppState>('appStore', initialState);

/**
 * Getter function for the store
 */
export function getAppStore() {
  return store();
}
