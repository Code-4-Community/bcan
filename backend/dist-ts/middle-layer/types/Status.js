"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorStatus = exports.statusToString = exports.Status = void 0;
/**
 * Status Object
 *  (1) Potential: Grants to be applied for
 *  (2) Active: Grants with funds succesfully allocated
 *  (3) Inactive: Grant earnings are used up
 */
var Status;
(function (Status) {
    Status["Potential"] = "Potential";
    Status["Active"] = "Active";
    Status["Inactive"] = "Inactive";
})(Status = exports.Status || (exports.Status = {}));
// TODO: 1) override stringify behavior of status enum 2) stringify, and then go back and modify enum (create helper function to generalize)
// 3) turn enums to string
// string rep of status
function statusToString(status) {
    switch (status) {
        case 'My Grants': return null; // no filter
        case 'Active Grants': return Status.Active;
        case 'Inactive Grants': return Status.Inactive;
        case 'Potential Grants': return Status.Potential;
        default: throw new Error(`Unknown status: ${status}`);
    }
}
exports.statusToString = statusToString;
// color associated with status on UI, represented as a string
function getColorStatus(status) {
    switch (status) {
        case "Active": return "#5AB911"; // green
        case "Inactive": return "#A9A9A9"; // gray
        case "Potential": return "#E6CA15"; // TODO: no color given for potential yet
        default: return 'Unknown';
    }
}
exports.getColorStatus = getColorStatus;
