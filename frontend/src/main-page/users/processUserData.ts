import { useEffect } from "react";
import { User } from "../../../../middle-layer/types/User.ts";
import { api } from "../../api.ts";
import { getAppStore } from "../../external/bcanSatchel/store.ts";

// fetch grants
export const fetchActiveUsers = async (): Promise<User[]> => {
  try {
    const response = await api("/user/active", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }

    const activeUsers = await response.json();
    return activeUsers as User[];
  } catch (error) {
    console.error("Error fetching active users:", error);
    return []; // Return empty array on error
  }
};

export const fetchInactiveUsers = async () => {
  try {
    const response = await api("/user/inactive", { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const inactiveUsers = await response.json();
    return inactiveUsers as User[];
  } catch (error) {
    console.error("Error fetching active users:", error);
  }
};

const searchFilter = (searchQuery: string) => (user: User) => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();
  const firstName = user.firstName?.toLowerCase() || "";
  const lastName = user.lastName?.toLowerCase() || "";
  const email = user.email?.toLowerCase() || "";

  return (
    firstName.includes(query) ||
    lastName.includes(query) ||
    email.includes(query)
  );
};

const filterUsers = (users: User[], predicates: ((user: User) => boolean)[]) =>
  users.filter((user) => predicates.every((fn) => fn(user)));

const sortUsers = (users: User[], header: keyof User, sort: "asc" | "desc" | "none") =>
  [...users].sort((a: User, b: User) => {
      const direction = sort === "asc" ? -1 : 1;

      const aValue = a[header];
      const bValue = b[header];

      if (aValue == null) return -1 * direction;
      if (bValue == null) return 1 * direction;

      if (aValue > bValue) return 1 * direction;
      if (aValue < bValue) return -1 * direction;

      return 0;
    })


// contains callbacks for sorting and filtering grants
// stores state for list of grants/filter
export const ProcessUserData = () => {
  const { activeUsers, inactiveUsers, userQuery, userSort } = getAppStore();

  // fetch grants on mount if empty
  useEffect(() => {
    if (activeUsers.length === 0) fetchActiveUsers();
    if (inactiveUsers.length === 0) fetchInactiveUsers();
  }, [activeUsers.length, inactiveUsers.length]);

  // compute filtered grants dynamically — no useState needed
  const activeFiltered = filterUsers(activeUsers, [searchFilter(userQuery)]);

  const inactiveFiltered = filterUsers(inactiveUsers, [
    searchFilter(userQuery),
  ]);

  const sortedActive = userSort && userSort.sort !== "none"
  ? sortUsers(activeFiltered, userSort.header, userSort.sort)
  : activeFiltered;

  const sortedInactive = userSort && userSort.sort !== "none"
  ? sortUsers(inactiveFiltered, userSort.header, userSort.sort)
  : inactiveFiltered;

  return { activeUsers: sortedActive, inactiveUsers: sortedInactive };
};
