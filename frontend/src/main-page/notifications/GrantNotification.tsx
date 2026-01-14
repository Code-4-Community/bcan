import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FaTrash } from "react-icons/fa";

interface GrantNotificationProps {
    notificationId: string;
    title: string;
    message: string;
    onDelete: (notificationId: string) => void;
}

const GrantNotification: React.FC<GrantNotificationProps> = ({
    notificationId, 
    title, 
    message, 
    onDelete 
}) => {
    const handleDelete = () => {
        onDelete(notificationId);
    };

    return (
        <div className="grant-notification" role="listitem">
            <div className="bell-notif">
                <FontAwesomeIcon icon={faBell} style={{ color: "gray"}} />
            </div>
            <div className="notification-text">
                <div className="notification-title">{title}</div>
                <div className="notification-message">{message}</div>
            </div>
            <FaTrash
                className="notification-trash-icon"
                title="Delete notification"
                onClick={handleDelete}
                style={{ cursor: "pointer" }}
            />
            </div>
    );
};

export default GrantNotification;
