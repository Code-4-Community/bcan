import { Notification } from "../../../../middle-layer/types/Notification";
import { api } from "../../api";
import { getAppStore } from "../../external/bcanSatchel/store";
import { setNotifications } from "../../external/bcanSatchel/actions";

const store = getAppStore();

export const fetchNotifications = async () => {
  try {
    const response = await api(`/notifications/user/${store.user?.email}/current`);
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const updatedNotifications: Notification[] = await response.json();
    console.log("Fetched notifications: ", updatedNotifications);
    setNotifications(updatedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};