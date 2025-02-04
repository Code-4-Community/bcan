// model for Grant objects
export default interface Grant {
    grantId: number;
    organization_name: string;
    description: string;
    is_bcan_qualifying: boolean;
    status: string;
    amount: number;
    deadline: string;       // dynamo does not have a built-in Date type and will be in iso8601
    notifications_on_for_user: boolean;
    reporting_requirements: string;
    restrictions: string;
    point_of_contacts: string[];
    attached_resources: string[];
    comments: string[];
}

