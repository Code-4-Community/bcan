import { TDateISO } from "../../backend/src/utils/date";

/**
 * Notification Object
 */
export interface Notification {
    notificationId: string; // Partition
    userEmail: string;
    message: string;
    alertTime: TDateISO; // Sort
    sent: boolean; // email has been sent for this notification
  }