import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { api } from "../../api";
import NotificationPopup from "../notifications/NotificationPopup";

// get current user id
// const currUserID = sessionStorage.getItem('userId');
const currUserID = "bcanuser33";

const BellButton = () => {
  // stores notifications for the current user
  const [notifications, setNotifications] = useState<any[]>([]);

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
      {id: 1, title: "Grant Deadline", message: "Grant A deadline approaching in 3 days"},
      {id: 2, title: "Grant Deadline", message: "Grant B deadline tomorrow!"}, 
      {id: 3, title: "Grant Deadline", message: "Grant C deadline passed yesterday!"},
    ];
    //const response = await api(
      //`/notifications/user/${currUserID}`,
      //{
        //method: "GET",
      //}
    //);
    //console.log(response);
    //const currNotifications = await response.json();
    setNotifications(dummyNotifications);
    setClicked(!isClicked);
    return notifications;
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
