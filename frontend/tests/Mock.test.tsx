// 1) So "toBeInTheDocument" is recognized:
import '@testing-library/jest-dom';

import React from 'react';
import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// 2) The component we want to test:
import Dashboard from '../src/Dashboard';

// 3) Import the modules we'll mock:
import * as storeModule from '../src/external/bcanSatchel/store';
import * as actionsModule from '../src/external/bcanSatchel/actions';

// 4) Mock them once. 
vi.mock('../src/external/bcanSatchel/store', () => ({
  // "getStore" must be a vi.fn(), so we can do .mockReturnValue
  getStore: vi.fn(),
}));

vi.mock('../src/external/bcanSatchel/actions', () => ({
  logout: vi.fn(),
}));

describe('Dashboard component', () => {
  it('renders user info from store and calls logout on click', () => {
    //
    // 5) Cast the "getStore" function to Vitest's "Mock" type for TS
    //
    const getStoreMock = storeModule.getStore as Mock;

    //
    // 6) Provide a fake return value for "getStore()"
    //
    getStoreMock.mockReturnValue({
      // This simulates your store content:
      isAuthenticated: true,
      accessToken: 'fake-token',
      user: { userId: 'TestUser123', email: 'test@example.com', biography: '' },
    });

    //
    // 7) Render the component
    //
    render(<Dashboard />);

    //
    // 8) Check for the user info
    //
    expect(screen.getByText('Welcome, TestUser123')).toBeInTheDocument();

    //
    // 9) Click the logout button
    //
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    //
    // 10) Confirm the logout action was called
    //
    expect(actionsModule.logout).toHaveBeenCalledTimes(1);
  });
});
