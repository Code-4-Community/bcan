/**
 * Status Object
 *  (1) Potential: Grants to be applied for
 *  (2) Active: Grants with funds succesfully allocated
 *  (3) Inactive: Grant earnings are used up
 */
export enum Status {
    Potential= "Potential",
    Active = "Active",
    Inactive = "Inactive",
    Rejected = "Rejected",
    Pending = "Pending"
}

// TODO: 1) override stringify behavior of status enum 2) stringify, and then go back and modify enum (create helper function to generalize)
// 3) turn enums to string

// string rep of status
export function statusToString(status: string): Status | null{
    switch (status) {
        case 'My Grants': return null; // no filter
        case 'Active Grants': return Status.Active;
        case 'Inactive Grants': return Status.Inactive;
        case 'Potential Grants': return Status.Potential;
        case 'Rejected Grants': return Status.Rejected;
        case 'Pending Grants': return Status.Pending;
        default: throw new Error(`Unknown status: ${status}`);
    }
}

// color associated with status on UI, represented as a string
export function getColorStatus(status: string) {
    switch (status) {
        case "Active": return "#5AB911"; // green
        case "Inactive": return "#A9A9A9" // gray
        case "Potential": return "#E6CA15" // TODO: no color given for potential yet
        // TODO add colors for rejected and pending
        case "Rejected": return "#FF0000" // red
        case "Pending": return "#FFA500" // orange
        default: return 'Unknown';
    }
}