import { TDateISO } from "../../backend/src/utils/date";

/**
 * Notification Object
 */
export interface History {
    grantId: number; // Partition
    timestamp: TDateISO
    field: string;
    oldValue: any;
    newValue: any; // Sort
  }