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
    const date = new Date(dateStr);
    const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 6) {
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const y = date.getFullYear();
        const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${m}/${d}/${y} | ${time}`;
    }
    return date.toLocaleString('en-US', {
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

        <div className="rounded-md flex items-center gap-3 px-4 py-3 hover:bg-grey-150 transition-colors" role="listitem">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-grey-500 flex items-center justify-center flex-shrink-0">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm font-semibold text-white">{initials}</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-black">{message}</div>
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
