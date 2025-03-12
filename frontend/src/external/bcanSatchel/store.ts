import { createStore } from 'satcheljs';

export interface User {
  userId: string;
  email: string;
  position_or_role: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  allGrants: Grant[] | []
}

// model for Grant objects, matches exactly the same as backend grant.model
// TODO: should synchronize from same file?
export interface Grant {
  grantId: number;
  organization_name: string;
  description: string;
  is_bcan_qualifying: boolean;
  status: string;
  amount: number;
  deadline: string;
  notifications_on_for_user: boolean;
  reporting_requirements: string;
  restrictions: string;
  point_of_contacts: string[];
  attached_resources: string[];
  comments: string[];
  isArchived : boolean;
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
