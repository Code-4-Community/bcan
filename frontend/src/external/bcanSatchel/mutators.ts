// src/mutators.ts

import { mutator } from 'satcheljs';
import { setAuthentication, updateUserProfile, logout } from './actions';
import { getStore } from './store';

mutator(setAuthentication, (actionMessage) => {
  const store = getStore();
  store.isAuthenticated = actionMessage.isAuthenticated;
  store.user = actionMessage.user;
  store.accessToken = actionMessage.accessToken;
});

mutator(updateUserProfile, (actionMessage) => {
  const store = getStore();
  if (store.user) {
    store.user = {
      ...store.user,
      ...actionMessage.user,
    };
  }
});

mutator(logout, () => {
  const store = getStore();
  store.isAuthenticated = false;
  store.user = null;
  store.accessToken = null;
});