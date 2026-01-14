import { api } from "../../api"
import { User } from "../../../../middle-layer/types/User";
import { setActiveUsers, setInactiveUsers } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { toJS } from "mobx";
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

export const fetchInactiveUsers = async (): Promise<User[]> => {
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
        return []; // Return empty array on error

  }
}


export const fetchUsers = async () => {
  console.log("Fetching users...");
      const active = await fetchActiveUsers();
      const inactive = await fetchInactiveUsers();
      if (active) {
        setActiveUsers(active);
        console.log("Active users fetched:", toJS(getAppStore().activeUsers));
      }
      if (inactive) {
        setInactiveUsers(inactive);
        console.log("Inactive users fetched:", toJS(getAppStore().inactiveUsers));
      }
    };

export const moveUserToActive = (user: User) => {
  setActiveUsers([...getAppStore().activeUsers, user]);
  setInactiveUsers(getAppStore().inactiveUsers.filter(u => u.userId !== user.userId));
}

export const removeUser = (user: User) => {
  setInactiveUsers(getAppStore().inactiveUsers.filter(u => u.userId !== user.userId));
}