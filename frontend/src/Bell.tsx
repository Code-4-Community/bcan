// BellButton.js
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const currUserID = "bcanuser33"   // test

const BellButton = () => {

    
    // stores notifications for the current user
    const [notifications, setNotifications] = useState<any[]>([])   

    // determines whether bell has been clicked
    const [isClicked, setClicked] = useState(false)   

    // logs the notifications for the current user whenever they are fetched
    useEffect(() => {
        console.log(notifications)
    }, [notifications]);


    // function that handles when button is clicked and fetches notifications
    const handleClick = async () => {
        const response = await fetch(`http://localhost:3001/notifications/user/${currUserID}`, {
            method: 'GET'
        });
        const currNotifications = await response.json()
        setNotifications(currNotifications)
        setClicked(!isClicked)
        return notifications
    }

    return (
        <>
        <button className="bell-button" onClick={handleClick}>
            <FontAwesomeIcon icon={faBell} />
        </button>
        {isClicked && 
                <div className="notification-modal">
                    <div className="notification-modal-content">
                        <h4>Notifications</h4>
                        <ul>
                            {notifications.map((notification, index) => (
                                <li key={index} className="notification-item">
                                    {notification.message} <br />
                                    <small>Alert Time: {notification.alertTime}</small>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => setClicked(false)}
                            className="notification-close-button"
                        >
                            Close
                        </button>
                    </div>
                </div>}
        </>
    );
};

export default BellButton;
