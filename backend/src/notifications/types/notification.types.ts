import { TDateISO } from "../../utils/date";

export class NotificationBody {
    notificationId!: string;
    userEmail!: string;
    message!: string;
    alertTime!: TDateISO;
    sent!: boolean;
}