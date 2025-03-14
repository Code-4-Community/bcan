import { createStore } from 'satcheljs';
import { User } from '../../../../middle-layer/types/User'
import { Grant } from '../../../../middle-layer/types/Grant'

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  allGrants: Grant[] | []
}

// Define initial state
const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  allGrants: []
};

const store = createStore<AppState>('appStore', initialState);

/**
 * Getter function for the store
 */
export function getAppStore() {
  return store();
}
