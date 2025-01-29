import "@testing-library/jest-dom"; // Enables 'toBeInDocument()'
import React from "react";
import { describe, it, expect, vi, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import Account from "../src/Account";
import { AuthProvider } from "../src/context/auth/authContext";

// Import the modules we'll mock:
import * as storeModule from "../src/external/bcanSatchel/store";
import * as actionsModule from "../src/external/bcanSatchel/actions";

// “flips the switch” and says “don’t use real code from this path.”
vi.mock("../src/external/bcanSatchel/store", () => ({
  getAppStore: vi.fn(),
}));

vi.mock("../src/external/bcanSatchel/actions", () => ({
  logoutUser: vi.fn(),
}));

/* You could do:

'''
vi.mock('../src/external/bcanSatchel/store', () => ({
  getStore: vi.fn(() => ({
    isAuthenticated: true,
    etc..,
  })),
}));
'''
This would remove the need to mock the return value again in the actual test.
But, that means you have a single static return value for getStore in all tests. Often, you need different behaviors in different tests. */

describe("Account component", () => {
  it("renders user info from store and calls logout on click", () => {
    // Setup
    const getStoreMock = storeModule.getAppStore as Mock;
    getStoreMock.mockReturnValue({
      // simulate store content:
      isAuthenticated: true,
      accessToken: "fake-token",
      user: { userId: "TestUser123", email: "test@example.com", biography: "" },
    });

    // Act 1
    render(
      <AuthProvider>
        <Account />
      </AuthProvider>
    );

    // Eval 1
    expect(screen.getByText("Welcome, TestUser123")).toBeInTheDocument();

    // Act 2
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    // Eval 2
    expect(actionsModule.logoutUser).toHaveBeenCalledTimes(1);
  });
});
