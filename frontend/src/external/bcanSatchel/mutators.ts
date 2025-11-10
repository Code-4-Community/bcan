import { mutator } from 'satcheljs';
import {
  setAuthState,
  updateUserProfile,
  logoutUser,
  fetchAllGrants,
  updateFilter,
  updateStartDateFilter, updateEndDateFilter,
  updateSearchQuery,
  updateYearFilter,
  setNotifications
} from './actions';
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

/**
 * Modifies satchel store to get updated version of the filter
 */
mutator(updateFilter, (actionMessage) => {
  const store = getAppStore();
  store.filterStatus = actionMessage.status;
})

mutator(updateStartDateFilter, (actionMessage) => {
  const store = getAppStore();
  store.startDateFilter = actionMessage.startDateFilter;
})

mutator(updateEndDateFilter, (actionMessage) => {
  const store = getAppStore();
  store.endDateFilter = actionMessage.endDateFilter;
})

mutator(updateSearchQuery, (actionMessage) => {
  const store = getAppStore();
  store.searchQuery = actionMessage.searchQuery;
})

mutator(updateYearFilter, (actionMessage) => {
  const store = getAppStore();
  store.yearFilter = actionMessage.yearFilter;
})

mutator(setNotifications, (actionMessage) => {
  const store = getAppStore();
  store.notifications = actionMessage.notifications;
})
