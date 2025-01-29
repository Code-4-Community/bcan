// Extending the built-in Date interface to give a precise return type to toISOString
declare global {
  interface Date {
    toISOString(): TDateISO;
  }
}

// Type aliases for different parts of a date/time string
type TYear = `${number}${number}${number}${number}`;
type TMonth = `${number}${number}`;
type TDay = `${number}${number}`;
type THours = `${number}${number}`;
type TMinutes = `${number}${number}`;
type TSeconds = `${number}${number}`;
type TMilliseconds = `${number}${number}${number}`;

// Represent a string like `2021-01-08` (date only)
type TDateISODate = `${TYear}-${TMonth}-${TDay}`;

// Represent a string like `14:42:34.678` (time part)
type TDateISOTime = `${THours}:${TMinutes}:${TSeconds}.${TMilliseconds}`;

// Represent a string like `2021-01-08T14:42:34.678Z` (full ISO 8601 format)
type TDateISOFull = `${TDateISODate}T${TDateISOTime}Z`;

// Expects either the full date-time format or date-only format
export type TDateISO = TDateISOFull | TDateISODate;
