import GrantNotification from "./GrantNotification";
import { FaTrash } from "react-icons/fa";

interface NotificationPopupProps {
    notifications: any[];
    onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
    notifications,
    onClose
}) => {
    return (
        <div className="notification-popup">
            <div className="popup-header">
                <h3>Grant Deadlines</h3>
                <button className="close-button" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="notification-list">
                {notifications.length > 0 ? (
                    notifications.map((n) => (
                        <GrantNotification key={n.id} message={n.message} />
                    ))
                ) : (
                    <p className="empty-text">No new notifications</p>
                )}
            </div>

            <div className="trash-container">
                <FaTrash
                className="trash-icon"
                title="Delete all notifications (coming later)"
                />
            </div>
        </div>
    );
};

export default NotificationPopup;