import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
//import { api } from "../../api"; //todo: swap out dummy data with real api fetch when backend is ready
import NotificationPopup from "../notifications/NotificationPopup";
import { setNotifications as setNotificationsAction } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";

// get current user id
// const currUserID = sessionStorage.getItem('userId');
// const currUserID = "bcanuser33";

const BellButton = () => {
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
    //temporary dummy data for now
    const dummyNotifications = [
      {
        id: 1,
        title: "Grant Deadline",
        message: "Grant A deadline approaching in 3 days",
      },
      { id: 2, title: "Grant Deadline", message: "Grant B deadline tomorrow!" },
      {
        id: 3,
        title: "Grant Deadline",
        message: "Grant C deadline passed yesterday!",
      },
      { id: 4, title: "Grant Deadline", message: "Grant D deadline tomorrow!" },
    ];
    //previous api logic (for later)
    //const response = await api(
    //`/notifications/user/${currUserID}`,
    //{
    //method: "GET",
    //}
    //);
    //console.log(response);
    //const currNotifications = await response.json();
    setNotificationsAction(dummyNotifications);
    setClicked(!isClicked);
    return notifications;
  };

  const handleClose = () => setClicked(false);

  return (
    <div className="bell-container">
      <div
        className="bell-wrapper"
        style={{ position: "relative", display: "inline-block" }}
      >
        <button
          className={`bell-button ${isClicked ? "hovered" : ""}`}
          onClick={handleClick}
          style={{ background: "none", position: "relative" }}
        >
          <FontAwesomeIcon
            icon={faBell}
            style={{ color: "black"}}
          />
        </button>

        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              width: "10px",
              height: "10px",
              backgroundColor: "red",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
        )}
      </div>

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
