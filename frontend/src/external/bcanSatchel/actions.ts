import { action } from 'satcheljs';
import { Grant } from './store.js'

/**
 * Set whether the user is authenticated, update the user object,
 * and store the access token.
 */
export const setAuthState = action(
  'setAuthState',
  (isAuthenticated: boolean, user: any, accessToken: string | null) => ({
    isAuthenticated,
    user,
    accessToken,
  })
);

/**
 * Update user's profile data (email, biography, etc.).
 */
export const updateUserProfile = action('updateUserProfile', (user: any) => ({
  user,
}));

/**
 * Completely log out the user (clear tokens, user data, etc.).
 */
export const logoutUser = action('logoutUser');

/**
 * Moves along the all grants that are fetched from back end to mutator.
 */
export const fetchAllGrants = action(
    'fetchAllGrants',
    (grants: Grant[]) => ({grants})
);
