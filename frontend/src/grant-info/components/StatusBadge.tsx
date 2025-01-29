import { Badge } from "@chakra-ui/react";
import { isActiveStatus } from "./GrantStatus";

export function StatusBadge({ status }: { status: string }) {
  // For more granular control:
  let colorScheme: string;
  switch (status) {
    case "Pending":
      colorScheme = "orange";
      break;
    case "In Review":
      colorScheme = "yellow";
      break;
    case "Awaiting Submission":
      colorScheme = "teal";
      break;
    case "Approved":
      colorScheme = "green";
      break;
    case "Rejected":
    case "Cancelled":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }

  return (
    <Badge colorScheme={colorScheme} variant="subtle" borderRadius="md" ml={2}>
      {isActiveStatus(status) ? "Active" : "Inactive"}
    </Badge>
  );
}
