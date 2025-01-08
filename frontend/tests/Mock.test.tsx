import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import Dashboard from '../src/Dashboard';

// Import the modules we'll mock:
import * as storeModule from '../src/external/bcanSatchel/store';
import * as actionsModule from '../src/external/bcanSatchel/actions';

vi.mock('../src/external/bcanSatchel/store', () => ({
  getStore: vi.fn(),
}));

vi.mock('../src/external/bcanSatchel/actions', () => ({
  logout: vi.fn(),
}));

describe('Dashboard component', () => {
  it('renders user info from store and calls logout on click', () => {

    // Setup
    const getStoreMock = storeModule.getStore as Mock;
    getStoreMock.mockReturnValue({
      // simulate store content:
      isAuthenticated: true,
      accessToken: 'fake-token',
      user: { userId: 'TestUser123', email: 'test@example.com', biography: '' },
    });

    // Act 1
    render(<Dashboard />);

    // Eval 1
    expect(screen.getByText('Welcome, TestUser123')).toBeInTheDocument();

    // Act 2
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    // Eval 2
    expect(actionsModule.logout).toHaveBeenCalledTimes(1);
  });
});
