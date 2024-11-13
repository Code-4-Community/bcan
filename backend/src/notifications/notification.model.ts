export interface Notification {
    notificationId: string; // Partition
    userId: string;
    message: string;
    alertTime: Date; // Sort
  }