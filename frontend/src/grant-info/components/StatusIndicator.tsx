// StatusIndicator.tsx

import React from "react";
import { Box, Text } from "@chakra-ui/react";

interface StatusIndicatorProps {
  isActive: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isActive }) => {
  const circleColor = isActive ? "#5AB911" : "#A9A9A9"; // #5AB911 = bright green from Figma
  const labelText = isActive ? "Active" : "Inactive";

  return (
    <Box 
      display="flex"
      alignItems="center"
    >
      <Box
        as="svg"
        width="39px"
        height="36px"
        fill="none"
      >
        <path
          d="M39 18C39 27.9411 30.2696 36 19.5 36C8.73045 36 0 27.9411 0 18C0 8.05887 8.73045 0 19.5 0C30.2696 0 39 8.05887 39 18Z"
          fill={circleColor}
        />
      </Box>

      {/* The text label: #000, "Helvetica Neue", 28px */}
      <Text
        ml="8px"
        color="#000"
        fontFamily='"Helvetica Neue", sans-serif'
        fontSize="20px"
        fontWeight="400"
        lineHeight="normal"
      >
        {labelText}
      </Text>
    </Box>
  );
};

export default StatusIndicator;
