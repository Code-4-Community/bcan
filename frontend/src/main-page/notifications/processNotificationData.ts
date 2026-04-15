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

    const payload = (await response.json()) as unknown;
    const updatedNotifications: Notification[] = Array.isArray(payload)
      ? (payload as Notification[])
      : Array.isArray((payload as { Items?: unknown[] })?.Items)
        ? ((payload as { Items: Notification[] }).Items)
        : [];

    console.log("Fetched notifications: ", updatedNotifications);
    setNotifications(updatedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};