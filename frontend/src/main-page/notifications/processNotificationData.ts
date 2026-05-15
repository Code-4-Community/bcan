import { Notification } from "../../../../middle-layer/types/Notification";
import { api } from "../../api";
import { getAppStore } from "../../external/bcanSatchel/store";
import { setNotifications } from "../../external/bcanSatchel/actions";

const store = getAppStore();

export const fetchNotifications = async () => {
  try {
    const userEmail = store.user?.email;  
    if (!userEmail) {  
      return;  
    }  

    const response = await api(`/notifications/user/${userEmail}/current`);
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