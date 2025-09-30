import { TDateISO } from "../../backend/src/utils/date";
import Attachment from "./Attachment";
import { Status } from "./Status";
import POC from "./POC";

// model for Grant objects
export interface Grant {
    grantId: number;
    organization: string;
    does_bcan_qualify: boolean;
    status: Status;
    amount: number;
    grant_start_date: TDateISO; // when the grant was started
    application_deadline: TDateISO; // when was grant submission due
    report_deadlines: TDateISO[];       // multiple report dates
    description: string;
    timeline: number; // Need to specify
    estimated_completion_time: number,
    grantmaker_poc: POC; // person of contact at organization giving the grant
    // bcan_poc may need to be changed later to be a validated account
    bcan_poc: POC; // person of contact at BCAN
    attachments: Attachment[];
    restricted_or_unrestricted: string; // "restricted" or "unrestricted"
}