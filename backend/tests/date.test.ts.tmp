import { describe, it, expect } from 'vitest';
import { TDateISO } from '../src/utils/date';  // Import the type

// Helper function to check if a string matches the YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ format
const isDateISO = (date: string): boolean => {
  // Regex for the format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
  const regex = /^(?:\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;
  return regex.test(date);
};

describe('Date ISO Format', () => {
  it('should match the expected date format (YYYY-MM-DD)', () => {
    const date: TDateISO = '2025-01-28'; // YYYY-MM-DD
    expect(isDateISO(date)).toBe(true);
  });

  it('should match the expected date-time format (YYYY-MM-DDTHH:mm:ss.sssZ)', () => {
    const date: TDateISO = '2025-01-28T14:42:34.678Z'; // YYYY-MM-DDTHH:mm:ss.sssZ
    expect(isDateISO(date)).toBe(true);
  });

  it('should match the correct format for `toISOString()` method', () => {
    const date = new Date();
    const isoString: TDateISO = date.toISOString();
    expect(isDateISO(isoString)).toBe(true);
  });

  it('should return a string in the correct format from `toISOString()`', () => {
    const date = new Date();
    const isoString = date.toISOString();
    // Check if the ISO string matches either of the two formats
    expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/);
  });
});
