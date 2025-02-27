import { Badge, Box } from "@chakra-ui/react";
import { isActiveStatus } from "./GrantStatus";

export function StatusBadge({ status }: { status: string }) {
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
      colorScheme = "red";
      break;
    case "Cancelled":
      colorScheme = "red";
      break;
    default:
      colorScheme = "gray";
  }

  return (
    <Badge colorPalette={colorScheme} variant="solid" borderRadius="md" ml={2}>
      <Box
        as="span"
        w="6px"
        h="6px"
        borderRadius="full"
        bg={isActiveStatus(status) ? "green.600" : "red.600"}
        mr={2}
      />
      {isActiveStatus(status) ? "Active" : "Inactive"}
    </Badge>
  );
}
