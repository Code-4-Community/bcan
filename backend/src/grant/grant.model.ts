// model for Grant objects
export interface Grant {
    grantId: number;
    organization_name: string;
    description: string;
    is_bcan_qualifying: boolean;
    status: string;
    amount: number;
    deadline: Date; 
    notifications_on_for_user: boolean;
    reporting_requirements: string;
    restrictions: string;
    point_of_contacts: string[];
    attached_resources: string[];
    comments: string;
}