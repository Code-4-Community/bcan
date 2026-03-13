import { Grant } from "../../../../../middle-layer/types/Grant.ts";
import { User } from "../../../../../middle-layer/types/User.ts";

// filters grants by looping thru all filters
export const filterGrants = (
  grants: Grant[],
  predicates: ((grant: Grant) => boolean)[]
) => grants.filter((grant) => predicates.every((fn) => fn(grant)));

// for subheaders for a single status
export const statusFilter = (status: string | null) => (grant: Grant) =>
  !status || grant.status === status;

// TODO note: what attribute to filter by? currently doing application deadline
// filter for calendar feature, if both null no filter, if 1 null, one-sided filter
export const dateRangeFilter =
  (start: Date | null, end: Date | null) => (grant: Grant) => {
    const date = new Date(grant.application_deadline);
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  };

/**
 * Returns a predicate that determines whether the grant provided to it has an organization
 * name that contains the given search query.
 *
 * @param searchQuery - The search term to match against organization names
 * @returns A predicate function that takes a Grant and returns a boolean
 */
export const searchFilter = (searchQuery: string) => (grant: Grant) => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();
  const organization = grant.organization?.toLowerCase() || "";

  return organization.includes(query);
};

export const yearFilterer = (years: number[] | null) => (grant: Grant) => {
    if (!years || years.length == 0) return true;
    const grantYear = new Date(grant.application_deadline).getFullYear();
    return years.includes(grantYear);
}

export const eligibleFilter = (eligibleOnly: boolean) => (grant: Grant) => {
  if (eligibleOnly) {
    return grant.does_bcan_qualify;
  }
  return true;
};

export const amountRangeFilter =
  (minAmount: number | null, maxAmount: number | null) => (grant: Grant) => {
    if (minAmount !== null && grant.amount < minAmount) return false;
    if (maxAmount !== null && grant.amount > maxAmount) return false;
    return true;
  };

/**
 * Returns a predicate that determines whether the grant's BCAN POC email
 * matches the given user email filter.
 *
 * @param userEmail - The email address to filter by (current user's email)
 * @param user - The current user object
 * @returns A predicate function that takes a Grant and returns a boolean
 */
export const userEmailFilter = (userEmail: boolean, user: User | null) => (grant: Grant) => {
  if (!userEmail || !user) return true;
  
  const grantPocEmail = grant.bcan_poc?.POC_email?.toLowerCase();
  return grantPocEmail === user.email.toLowerCase();
}
