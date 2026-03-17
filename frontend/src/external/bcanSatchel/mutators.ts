import { mutator } from "satcheljs";
import {
  setAuthState,
  updateUserProfile,
  logoutUser,
  fetchAllGrants,
  updateFilter,
  updateStartDateFilter,
  updateEndDateFilter,
  updateSearchQuery,
  updateYearFilter,
  updateUserEmailFilter,
  updateEligibleOnly,
  updateAmountRange,
  setNotifications,
  updateSort,
  updateUserQuery,
  updateUserSort,
  clearAllFilters,
} from "./actions";
import { getAppStore, persistToSessionStorage } from "./store";
import { setActiveUsers, setInactiveUsers, removeProfilePic } from "./actions";

/**
 * setActiveUsers mutator
 */
mutator(setActiveUsers, (actionMessage) => {
  const store = getAppStore();
  store.activeUsers = actionMessage.users;
  persistToSessionStorage();
});

/**
 * setInactiveUsers mutator
 */
mutator(setInactiveUsers, (actionMessage) => {
  const store = getAppStore();
  store.inactiveUsers = actionMessage.users;
  persistToSessionStorage();
});

/**
 * setAuthState mutator
 */
mutator(setAuthState, (actionMessage) => {
  console.log("=== setAuthState MUTATOR CALLED ===");
  const store = getAppStore();
  console.log("Setting user:", actionMessage.user);
  store.isAuthenticated = actionMessage.isAuthenticated;
  store.user = actionMessage.user;
  store.accessToken = actionMessage.accessToken;
  console.log("Calling persistToSessionStorage...");
  persistToSessionStorage();
});

/**
 * updateUserProfile mutator
 */
mutator(updateUserProfile, (actionMessage) => {
  const store = getAppStore();
  if (store.user) {
    // Capture old email before overwriting
    const oldEmail = store.user.email;

    store.user = {
      ...store.user,
      ...actionMessage.user,
    };

    const activeUserIndex = store.activeUsers?.findIndex(
      (u) => u.email === oldEmail
    );

    if (activeUserIndex !== undefined && activeUserIndex !== -1) {
      store.activeUsers[activeUserIndex] = {
       ...store.user
      };
    } else {
       // Find and update the matching user in inactiveUsers by old email
      const inactiveUserIndex = store.inactiveUsers?.findIndex(
      (u) => u.email === oldEmail
    );

    if (inactiveUserIndex !== undefined && inactiveUserIndex !== -1) {
      store.inactiveUsers[inactiveUserIndex] = {
       ...store.user
      };
    }
    }

    persistToSessionStorage();
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
  sessionStorage.removeItem("bcanAppStore");
});

// Clears all store filters
mutator(clearAllFilters, () => {
  const store = getAppStore();
  store.filterStatus = null;
  store.startDateFilter = null;
  store.endDateFilter = null;
  store.searchQuery = "";
  store.yearFilter = [];
  store.userQuery = "";
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
});

mutator(updateStartDateFilter, (actionMessage) => {
  const store = getAppStore();
  store.startDateFilter = actionMessage.startDateFilter;
});

mutator(updateEndDateFilter, (actionMessage) => {
  const store = getAppStore();
  store.endDateFilter = actionMessage.endDateFilter;
});

mutator(updateUserEmailFilter, (actionMessage) => {
  const store = getAppStore();
  store.emailFilter = actionMessage.userEmailFilter;
})

mutator(updateEligibleOnly, (actionMessage) => {
  const store = getAppStore();
  store.eligibleOnly = actionMessage.eligibleOnly;
})

mutator(updateAmountRange, (actionMessage) => {
  const store = getAppStore();
  store.amountMinFilter = actionMessage.amountMinFilter;
  store.amountMaxFilter = actionMessage.amountMaxFilter;
})

mutator(updateSearchQuery, (actionMessage) => {
  const store = getAppStore();
  store.searchQuery = actionMessage.searchQuery;
});

mutator(updateYearFilter, (actionMessage) => {
  const store = getAppStore();
  store.yearFilter = actionMessage.yearFilter;
});

mutator(setNotifications, (actionMessage) => {
  const store = getAppStore();
  store.notifications = actionMessage.notifications;
});

mutator(updateSort, (actionMessage) => {
  const store = getAppStore();
  store.sort = actionMessage.sort;
});

mutator(updateUserQuery, (actionMessage) => {
  const store = getAppStore();
  store.userQuery = actionMessage.userQuery;
});

mutator(updateUserSort, (actionMessage) => {
  const store = getAppStore();
  store.userSort = actionMessage.sort;
});

mutator(removeProfilePic, () => {
  const store = getAppStore();

  if (!store.user) return;

  delete store.user.profilePicUrl;

  const activeUserIndex = store.activeUsers?.findIndex(
    (u) => u.email === store.user!.email
  );

  if (activeUserIndex !== undefined && activeUserIndex !== -1) {
    delete store.activeUsers[activeUserIndex].profilePicUrl;
  }

  persistToSessionStorage();
});
