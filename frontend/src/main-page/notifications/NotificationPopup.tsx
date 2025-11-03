import { createPortal } from 'react-dom';
import GrantNotification from "./GrantNotification";
import { FaTrash } from "react-icons/fa";
import '../../styles/notification.css';

interface NotificationPopupProps {
    notifications: any[];
    onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
    notifications,
    onClose
}) => {
    return createPortal(
        <div className="notification-popup">
            <div className="popup-header">
                <h3>Alerts</h3>
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
        </div>,
        document.body
    );
};

export default NotificationPopup;