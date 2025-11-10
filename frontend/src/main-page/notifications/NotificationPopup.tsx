import { createPortal } from 'react-dom';
import GrantNotification from "./GrantNotification";
import '../../styles/notification.css';
import { api } from "../../api";
import { setNotifications as setNotificationsAction } from "../../external/bcanSatchel/actions";
import { useAuthContext } from "../../context/auth/authContext";
import { Notification } from "../../../../middle-layer/types/Notification";

interface NotificationPopupProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
    notifications,
    onClose
}) => {
    const { user } = useAuthContext();

    const handleDelete = async (notificationId: string) => {
        try {
            const response = await api(
                `/notifications/${notificationId}`,
                {
                    method: "DELETE",
                }
            );

        if (!response.ok) {
            console.error("Failed to delete notification:", response.statusText);
            return;
        }

        if (user?.userId) {
            const fetchResponse = await api(
                `/notifications/user/${user.userId}`,
                {
                    method: "GET",
                }
            );

            if (fetchResponse.ok) {
                const updatedNotifications = await fetchResponse.json();
                setNotificationsAction(updatedNotifications);
            }
        }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    return createPortal(
        <div className="notification-popup" role="dialog" aria-label="Notifications">
            <div className="popup-header">
                <h3>Alerts</h3>
                <button className="close-button" onClick={onClose} aria-label="Close notifications">
                    ✕
                </button>
            </div>

            <div className="notification-list">
                {notifications && notifications.length > 0 ? (
                    notifications.map((n) => (
                        <GrantNotification 
                        key={n.notificationId}
                        notificationId={n.notificationId}
                        title={n.message}
                        message={`Alert at: ${new Date(n.alertTime).toLocaleString()}`}
                        onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <p className="empty-text">No new notifications</p>
                )}
            </div>
        </div>,
        document.body
    );
};

export default NotificationPopup;