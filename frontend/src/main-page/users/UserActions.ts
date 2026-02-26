import { api } from "../../api";
import { User } from "../../../../middle-layer/types/User";
import {
  setActiveUsers,
  setInactiveUsers,
} from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { toJS } from "mobx";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";

const store = getAppStore();

export const fetchActiveUsers = async (): Promise<User[]> => {
  try {
    const response = await api("/user/active", {
      method: "GET",
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
};

export const fetchInactiveUsers = async (): Promise<User[]> => {
  try {
    const response = await api("/user/inactive", { method: "GET" });
    if (!response.ok && response.status !== 200) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const inactiveUsers = await response.json();
    return inactiveUsers as User[];
  } catch (error) {
    console.error("Error fetching inactive users:", error);
    return []; // Return empty array on error
  }
};

export const fetchUsers = async () => {
  console.log("Fetching users...");
  const active = await fetchActiveUsers();
  const inactive = await fetchInactiveUsers();
  if (active) {
    setActiveUsers(active);
    console.log("Active users fetched:", toJS(store.activeUsers));
  }
  if (inactive) {
    setInactiveUsers(inactive);
    console.log("Inactive users fetched:", toJS(store.inactiveUsers));
  }
};

export const moveUserToActive = (user: User) => {
  setActiveUsers([...store.activeUsers, user]);
  setInactiveUsers(store.inactiveUsers.filter((u) => u.email !== user.email));
};

export const removeUser = (user: User) => {
  setInactiveUsers(store.inactiveUsers.filter((u) => u.email !== user.email));
  setActiveUsers(store.activeUsers.filter((u) => u.email !== user.email));
};

export const approveUser = async (
  user: User,
  setIsLoading: (loading: boolean) => void,
) => {
  setIsLoading(true);
  try {
    const response = await api("/user/change-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          email: user.email,
          position: user.position,
        } as User,
        groupName: "Employee",
        requestedBy: toJS(store.user) as User,
      }),
    });
    if (response.ok) {
      alert(`User ${user.email} has been approved successfully`);
      const body = await response.json();
      moveUserToActive(body as User);
    } else {
      alert("Failed to approve user");
    }
  } catch (error) {
    console.error("Error approving user:", error);
    alert("Error approving user");
  } finally {
    setIsLoading(false);
  }
};

export const deleteUser = async (
  user: User,
  setIsLoading: (loading: boolean) => void,
) => {
  setIsLoading(true);
  try {
    const response = await api(
      `user/delete-user/${encodeURIComponent(user.email)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            email: user.email,
            position: user.position,
          } as User,
          requestedBy: toJS(store.user) as User,
        }),
      },
    );

    if (response.ok) {
      console.log(`User ${user.email} has been deleted successfully`);
      alert(`User ${user.email} has been deleted successfully`);
      const body = await response.json();
      removeUser(body);
    } else {
      const errorBody = await response.json();
      console.error("Error: ", errorBody);
      alert("Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Error deleting user");
  } finally {
    setIsLoading(false);
  }
};

export const changeUserGroup = async (user: User) => {
  console.log(
    `Changing user ${user.email} to ${
      user.position === UserStatus.Admin ? "employee" : "admin"
    }...`,
  );

  try {
    const response = await api("/user/change-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          email: user.email,
          position: user.position,
        } as User,
        groupName:
          user.position === UserStatus.Admin
            ? UserStatus.Employee
            : UserStatus.Admin,
        requestedBy: toJS(store.user) as User,
      }),
    });

    if (response.ok) {
      console.log(
        `User ${user.email} successfully changed to ${
          user.position === UserStatus.Admin ? "employee" : "admin"
        }`,
      );
      alert(
        `User ${user.email} successfully changed to ${
          user.position === UserStatus.Admin ? "employee" : "admin"
        }`,
      );
      const updatedUser = await response.json();
      setActiveUsers([
        ...store.activeUsers.filter((u) => u.email !== user.email),
        updatedUser as User,
      ]);
    } else {
      const errorBody = await response.json();
      console.error("Error: ", errorBody);
    }
  } catch (error) {
    console.error("Error changing user group: ", error);
  }
};
