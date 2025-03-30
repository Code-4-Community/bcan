import { TDateISO } from "../../backend/src/utils/date";
import { FieldHistory } from "./FieldHistory";

/**
 * History Object
 */
export interface History {
  timestamp: TDateISO;
  updates: FieldHistory[];
}
