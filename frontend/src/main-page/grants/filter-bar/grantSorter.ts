import { Grant } from "../../../../../middle-layer/types/Grant";

// contains business logic for sorting grants based on subset of grant attributes
export const sortGrants = (grants: Grant[], header: keyof Grant, asc: boolean): Grant[] => {
    const handleNullOrUndefined = (a: Grant, b: Grant, header: keyof Grant) => {
        if (a[header] === null || a[header] === undefined) return 1;
        if (b[header] === null || b[header] === undefined) return -1;
        return 0;
    };

    return [...grants].sort((a, b) => {
        const nullCheck = handleNullOrUndefined(a, b, header);
        if (nullCheck !== 0) return nullCheck;

        if (header === "application_deadline") {
            const dateA = new Date(a[header]);
            const dateB = new Date(b[header]);
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            return asc ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }

        if (typeof a[header] === "string" && typeof b[header] === "string") {
            return asc ? a[header].localeCompare(b[header]) : b[header].localeCompare(a[header]);
        }

        if (typeof a[header] === "number" && typeof b[header] === "number") {
            return asc ? a[header] - b[header] : b[header] - a[header];
        }

        return 0;
    });
};
