// src/actions.ts

import { action } from 'satcheljs';

export const setAuthentication = action(
  'setAuthentication',
  (isAuthenticated: boolean, user: any, accessToken: string | null) => ({
    isAuthenticated,
    user,
    accessToken,
  })
);

export const updateUserProfile = action('updateUserProfile', (user: any) => ({
  user,
}));

export const logout = action('logout');