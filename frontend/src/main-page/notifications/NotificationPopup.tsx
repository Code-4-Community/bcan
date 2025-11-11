import { createPortal } from 'react-dom';
import GrantNotification from "./GrantNotification";
import '../../styles/notification.css';
import { api } from "../../api";
import { setNotifications as setNotificationsAction } from "../../external/bcanSatchel/actions";
import { useAuthContext } from "../../context/auth/authContext";
import { Notification } from "../../../../middle-layer/types/Notification";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from 'mobx-react-lite';

interface NotificationPopupProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = observer(({
    notifications,
    onClose
}) => {
    const { user } = useAuthContext();
    const store = getAppStore();
    const liveNotifications = store.notifications ?? [];

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

        // TODO: Remove hardcoded userId after /auth/session endpoint is fixed
        const testUserId = "bcanuser33"; //hardcode userid for refetch (test)

        const fetchResponse = await api(
            `/notifications/user/${testUserId}`,
            {
                method: "GET",
            }
        );

            if (fetchResponse.ok) {
                const updatedNotifications = await fetchResponse.json();
                setNotificationsAction(updatedNotifications);
            }
        }
        catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    console.log("Live notifications:", liveNotifications);

    return createPortal(
        <div className="notification-popup" role="dialog" aria-label="Notifications">
            <div className="popup-header">
                <h3>Alerts</h3>
                <button className="close-button" onClick={onClose} aria-label="Close notifications">
                    ✕
                </button>
            </div>

            <div className="notification-list">
                {liveNotifications && liveNotifications.length > 0 ? (
                    liveNotifications.map((n) => (
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
});

export default NotificationPopup;