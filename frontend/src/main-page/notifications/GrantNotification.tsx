import { FaTrash } from "react-icons/fa";

interface GrantNotificationProps {
    notificationId: string;
    message: string;
    alertTime: string;
    onDelete: (notificationId: string) => void;
    avatarUrl: string | null;
    firstName: string;
    lastName: string;
}

function formatAlertTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

const GrantNotification: React.FC<GrantNotificationProps> = ({
    notificationId, 
    message, 
    alertTime,
    onDelete,
    avatarUrl,
    firstName,
    lastName,
}) => {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    return (

        <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-grey-100 transition-colors" role="listitem">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-grey-500 flex items-center justify-center flex-shrink-0">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm font-semibold text-white">{initials}</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-black truncate">{message}</div>
                <div className="text-xs text-grey-500 mt-0.5">{formatAlertTime(alertTime)}</div>
            </div>

            <FaTrash
                className="flex-shrink-0 text-red hover:text-red-dark cursor-pointer text-sm"
                title="Delete notification"
                onClick={() => onDelete(notificationId)}
            />
        </div>
    );
};

export default GrantNotification;
