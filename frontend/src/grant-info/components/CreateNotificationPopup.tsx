import React, { useState } from "react";
import { Box, Button, Input, Text } from "@chakra-ui/react";

// Dummy or real service call to your NestJS backend
// e.g., POST /notifications
async function createNotificationBackend(payload: {
  userId: string;
  message: string;
  alertTime: string; 
}) {
  // Example fetch request; replace with your real endpoint & logic
  const response = await fetch("http://localhost:3001/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  
  if (!response.ok) {
    throw new Error("Failed to create notification");
  }
  return await response.json();
}

export function CreateNotificationPopup() {
  const [isOpen, setIsOpen] = useState(false);

  // Notification form fields (matching your Notification model minus notificationId)
  const [userId, setUserId] = useState("bcanuser33"); // or pass as prop
  const [message, setMessage] = useState("");
  const [alertTime, setAlertTime] = useState("");

  // Show/hide the popup
  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  // Handle "Save" / creation logic
  const handleSave = async () => {
    try {
      const isoTime = new Date(alertTime).toISOString();

      const newNotification = await createNotificationBackend({
        userId,
        message,
        alertTime: isoTime,
      });

      console.log("Notification created:", newNotification);

      setMessage("");
      setAlertTime("");
      // Then close
      closePopup();
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  };

  return (
    <Box>
      {/* The "Create New Notification" button */}
      <Button colorScheme="orange" onClick={openPopup}>
        + New Notification
      </Button>

      {isOpen && (
        // Dark overlay (like a custom modal)
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={9998}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* The white popup container */}
          <Box
            bg="black"
            p={6}
            borderRadius="md"
            boxShadow="lg"
            width="350px"
            zIndex={9999}
          >
            <Text fontSize="lg" mb={4} fontWeight="bold">
              Create New Notification
            </Text>

            {/* userId */}
            <Box mb={3}>
              <Text mb={1}>User ID</Text>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </Box>

            {/* message */}
            <Box mb={3}>
              <Text mb={1}>Message</Text>
              <Input
                placeholder="this is a test notification"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Box>

            {/* alertTime */}
            <Box mb={4}>
              <Text mb={1}>Alert Time</Text>
              <Input
                type="datetime-local"
                value={alertTime}
                onChange={(e) => setAlertTime(e.target.value)}
              />
            </Box>

            {/* Buttons */}
            <Box display="flex" justifyContent="flex-end">
              <Button variant="outline" mr={3} onClick={closePopup}>
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleSave}>
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
