import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { api } from "../../api";
import NotificationPopup from "../notifications/NotificationPopup";
import { setNotifications as setNotificationsAction } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { useAuthContext } from "../../context/auth/authContext";

// get current user id
// const currUserID = sessionStorage.getItem('userId');
// const currUserID = "bcanuser33";

const BellButton = () => {
  // gets current user from auth context
  const { user } = useAuthContext();

  // stores notifications for the current user
  const store = getAppStore();
  const notifications = store.notifications ?? [];

  // determines whether bell has been clicked
  const [isClicked, setClicked] = useState(false);

  // logs the notifications for the current user whenever they are fetched
  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

  // function that handles when button is clicked and fetches notifications
  const handleClick = async () => {
    // don't fetch if user isn't logged in (safe fallback)
    if (!user?.userId) {
      console.warn("No user logged in, cannot fetch notifications");
      setClicked(!isClicked);
      return;
    }

    try {
      // call backend route
      const response = await api(
        `/notifications/user/${user.userId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch notifications:", response.statusText);
        // still open popup even if fetch fails (show empty state)
        setClicked(!isClicked);
        return;
      }

      // parse the notifications from response
      const fetchedNotifications = await response.json();

      // update store with fetched notifications 
      setNotificationsAction(fetchedNotifications);

      // toggle popup open
      setClicked(!isClicked);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      //still open popup on error
      setClicked(!isClicked);
    }
    };

  const handleClose = () => setClicked(false);

  return (
    <div className="bell-container">
      <button
        className={`bell-button ${isClicked ? "hovered" : ""}`}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faBell} style={{ color: "black" }} />
      </button>

      {isClicked && (
        <NotificationPopup
        notifications={notifications}
        onClose={handleClose}
        />
      )}
    </div>
  );
};

export default BellButton;
