import { api } from "../../api"
import { User } from "../../../../middle-layer/types/User";
 import { getAppStore } from "../../external/bcanSatchel/store";
export const fetchActiveUsers = async (): Promise<User[]> => {
  try {
    const response = await api("/user/active", {
      method: 'GET'
    });

    if (!response.ok && response.status !== 200) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }

    const activeUsers = await response.json();
    return activeUsers as User[];
  } catch (error) {
    console.error("Error fetching active users:", error);
    return []; // Return empty array on error
  }
}

export const fetchInactiveUsers = async () => {
  try {
    const response = await api("/user/inactive", { method: 'GET' });
    if (!response.ok && response.status !== 200) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const inactiveUsers = await response.json();
    return inactiveUsers as User[];
  }
  catch (error) {
    console.error("Error fetching active users:", error);
  }
}


export const fetchUsers = async () => {
  const store = getAppStore();
      const active = await fetchActiveUsers();
      const inactive = await fetchInactiveUsers();
      if (active) {
        store.activeUsers = active;
      }
      if (inactive) {
        store.inactiveUsers = inactive;
      }
    };