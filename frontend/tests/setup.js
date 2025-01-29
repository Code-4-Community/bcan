import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from "@testing-library/jest-dom/matchers";

// Polyfill for crypto.getRandomValues in JSDOM
import { webcrypto } from 'crypto';

if (!global.crypto) {
  global.crypto = webcrypto;
}

expect.extend(matchers);

afterEach(() => {
  cleanup();
});