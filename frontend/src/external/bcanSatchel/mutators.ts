import { mutator } from 'satcheljs';
import { setAuthState, updateUserProfile, logoutUser, fetchAllGrants } from './actions';
import { getAppStore } from './store';

/**
 * setAuthState mutator
 */
mutator(setAuthState, (actionMessage) => {
  const store = getAppStore();
  store.isAuthenticated = actionMessage.isAuthenticated;
  store.user = actionMessage.user;
  store.accessToken = actionMessage.accessToken;
});

/**
 * updateUserProfile mutator
 */
mutator(updateUserProfile, (actionMessage) => {
  const store = getAppStore();
  if (store.user) {
    store.user = {
      ...store.user,
      ...actionMessage.user,
    };
  }
});

/**
 * logoutUser mutator
 */
mutator(logoutUser, () => {
  const store = getAppStore();
  store.isAuthenticated = false;
  store.user = null;
  store.accessToken = null;
});


/**
 * Reassigns all grants to new grants from the backend.
 */
mutator(fetchAllGrants, (actionMessage) => {
  const store = getAppStore();
  store.allGrants = actionMessage.grants;
});
