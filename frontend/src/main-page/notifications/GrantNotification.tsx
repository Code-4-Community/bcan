interface GrantNotificationProps {
    title: string;
    message: string;
}

const GrantNotification: React.FC<GrantNotificationProps> = ({ title, message }) => {
    return (
        <div className="grant-notification" role="listitem">
                <div className="notification-text">
                    <div className="notification-title>{title}">{title}</div>
                    <div className="notification-message">{message}</div>
                </div>
        </div>
    );
};

export default GrantNotification;
