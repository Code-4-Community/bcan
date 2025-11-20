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
  yearFilter:number[] | null;
  notifications: Notification[];
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
  yearFilter: null,
  notifications: []
};

const store = createStore<AppState>('appStore', initialState);

/**
 * Getter function for the store
 */
export function getAppStore() {
  return store();
}
