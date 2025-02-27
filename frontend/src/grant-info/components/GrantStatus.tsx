export function isActiveStatus(status: string): boolean {
    return ["Pending", "In Review", "Awaiting Submission"].includes(status);
}


