interface GrantNotificationProps {
    message: string;
}

const GrantNotification: React.FC<GrantNotificationProps> = ({ message }) => {
    return (
        <div className="grant-notification">
            {message}
        </div>
    );
};

export default GrantNotification;
