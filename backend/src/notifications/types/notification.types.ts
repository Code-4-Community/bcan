import { TDateISO } from "../../utils/date";

export class NotificationBody {
    notificationId!: string;
    userId!: string;
    message!: string;
    alertTime!: TDateISO;
    sent!: boolean;
}