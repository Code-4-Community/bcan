import { TDateISO } from "../../backend/src/utils/date";
import Attachment from "./Attachment";
import { Status } from "./Status";

// model for Grant objects
export interface Grant {
    grantId: number;
    organization: string;
    does_bcan_qualify: boolean;
    status: Status;
    amount: number;
    application_deadline: TDateISO; // when was grant submission due
    report_deadline: TDateISO;       // when is next report due
    notification_date: TDateISO; // date to hear back
    description: string;
    application_requirements: string;
    additional_notes: string;
    timeline: number; // Need to specify
    estimated_completion_time: number,
    grantmaker_poc: string[]; // array of emails
    attachments: Attachment[];
}