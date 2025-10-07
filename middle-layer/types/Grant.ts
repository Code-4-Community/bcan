import { TDateISO } from "../../backend/src/utils/date";
import Attachment from "./Attachment";
import { Status } from "./Status";
import POC from "./POC";

// model for Grant objects
export interface Grant {
    grantId: number; // unique id for each grant, automatically created
    organization: string; // organization giving the grant
    does_bcan_qualify: boolean; // does BCAN qualify for this grant
    status: Status; // current status of the grant: active, inactive, potential (grants BCAN may apply to), pending (grants BCAN is waiting to hear back from), rejected
    amount: number; // amount of money given by the grant
    grant_start_date: TDateISO; // when the grant money will start being issued
    application_deadline: TDateISO; // when was grant submission due
    report_deadlines?: TDateISO[];  // multiple report dates
    description?: string; // any additional information about the grant
    timeline: number; // how long the grant will last BCAN (e.g. grant will last 6 months --> 0.5 years)
    estimated_completion_time: number, // estimated time to complete the grant application in hours
    grantmaker_poc?: POC; // person of contact at organization giving the grant
    // bcan_poc may need to be changed later to be a validated account
    bcan_poc: POC; // person of contact at BCAN
    attachments: Attachment[]; // any attachments related to the grant
    restricted_or_unrestricted: string; // "restricted" or "unrestricted" (restricted means BCAN must use the money for a specific purpose)
}