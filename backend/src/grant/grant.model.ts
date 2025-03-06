// model for Grant objects
export interface Grant {
    grantId: number;
    organization: string;
    does_bcan_qualify: boolean;
    status: Status;
    amount: number;
    application_deadline: Date; // when was grant submission due
    report_deadline: Date;       // when is next report due
    notification_date: Date; // date to hear back
    description: string;
    timeline: number; // Need to specify
    estimated_completion_time: number,
    grantmaker_poc: string[]; // array of emails
    attachments: Attachment[];
}

// TODO: [JAN-13} Switch deadline to Proper "Date Time"
