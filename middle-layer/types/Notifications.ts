import { TDateISO } from "../../backend/src/utils/date";

/**
 * Notification Object
 */
export interface Notification {
    notificationId: string; // Partition
    userId: string;
    message: string;
    alertTime: TDateISO; // Sort
  }