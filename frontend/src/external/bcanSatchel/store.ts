import { createStore } from 'satcheljs';
import { User } from '../../../../middle-layer/types/User'
import { Grant } from '../../../../middle-layer/types/Grant'
import { Status } from '../../../../middle-layer/types/Status'
import { Notification } from '../../../../middle-layer/types/Notification'

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  allGrants: Grant[] | []
  filterStatus: Status | null;
  // TODO: should this be the ISODate type?
  startDateFilter: Date | null;
  endDateFilter: Date | null;
  searchQuery: string;
  yearFilter:number[] | [];
  activeUsers: User[] | [];
  inactiveUsers: User[] | [];
  sort: {header: keyof Grant, asc: boolean} | null;
  userSort: {header: keyof User, sort: "asc" | "desc" | "none"} | null;
  notifications: Notification[];
  userQuery: string;
}

// Define initial state
const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  allGrants: [],
  filterStatus: null,
  startDateFilter: null,
  endDateFilter: null,
  searchQuery: '',
  yearFilter: [],
  activeUsers: [],
  inactiveUsers: [],
  notifications: [],
  sort: null,
  userSort: null,
  userQuery: '',
};

/**
 * Hydrate store from sessionStorage
 */
function hydrateFromSessionStorage(): AppState {
  try {
    const saved = sessionStorage.getItem('bcanAppStore');
    console.log('Hydrating from sessionStorage:', saved); // Debug log
    if (saved) {
      const data = JSON.parse(saved);
      return {
        ...initialState,
        isAuthenticated: data.isAuthenticated ?? false,
        user: data.user ?? null,
        accessToken: data.accessToken ?? null,
        activeUsers: data.activeUsers ?? [],
        inactiveUsers: data.inactiveUsers ?? [],
      };
    }
  } catch (error) {
    console.error('Error hydrating store from sessionStorage:', error);
  }
  return initialState;
}

const store = createStore<AppState>('appStore', hydrateFromSessionStorage());

/**
 * Persist store to sessionStorage
 */
export function persistToSessionStorage() {
  try {
    const state = store();
    console.log('=== PERSIST START ===');
    console.log('Current state:', state);
    const dataToSave = {
      isAuthenticated: state.isAuthenticated,
      user: state.user ? JSON.parse(JSON.stringify(state.user)) : null,
      accessToken: state.accessToken,
      activeUsers: state.activeUsers ? state.activeUsers.map(u => JSON.parse(JSON.stringify(u))) : [],
      inactiveUsers: state.inactiveUsers ? state.inactiveUsers.map(u => JSON.parse(JSON.stringify(u))) : [],
    };
    console.log('Data to save:', dataToSave);
    sessionStorage.setItem('bcanAppStore', JSON.stringify(dataToSave));
    console.log('Successfully saved to sessionStorage');
    console.log('Verification - retrieved from storage:', sessionStorage.getItem('bcanAppStore'));
    console.log('=== PERSIST END ===');
  } catch (error) {
    console.error('Error persisting store to sessionStorage:', error);
  }
}

/**
 * Getter function for the store
 */
export function getAppStore() {
  const state = store();
  return state;
}
