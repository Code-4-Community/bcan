// src/store.ts

import { createStore } from 'satcheljs';
import { ObservableMap } from 'mobx'; // will use for complex type

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

const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
};

export const getStore = createStore<AppState>('appStore', initialState);