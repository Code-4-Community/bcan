import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

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
    const response = await fetch(
      `http://localhost:3001/notifications/user/${currUserID}`,
      {
        method: "GET",
      }
    );
    console.log(response);
    const currNotifications = await response.json();
    setNotifications(currNotifications);
    setClicked(!isClicked);
    return notifications;
  };

  return (
    <>
      <button
        className={`bell-button ${isClicked ? "hovered" : ""}`}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faBell} style={{ color: "black" }} />
      </button>
      {isClicked && (
        <div className="notification-modal">
          <div className="notification-modal-content">
            <h4>
              {currUserID ? `Notifications for ${currUserID}` : "Notifications"}
            </h4>
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notification, index) => (
                  <li key={index} className="notification-item">
                    {notification.message} <br />
                    <small>Alert Time: {notification.alertTime}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No new notifications</p>
            )}
            <button
              onClick={() => setClicked(false)}
              className="notification-close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BellButton;
