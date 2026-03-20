import { createPortal } from 'react-dom';
import GrantNotification from "./GrantNotification";
import { FaTrashAlt } from "react-icons/fa";
import { api } from "../../api";
import { setNotifications as setNotificationsAction } from "../../external/bcanSatchel/actions";
import { Notification } from "../../../../middle-layer/types/Notification";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from 'mobx-react-lite';

interface NotificationPopupProps {
    setOpenModal: (open: boolean) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = observer(({
    setOpenModal
}) => {
    const store = getAppStore();
    const liveNotifications: Notification[] = store.notifications ?? [];
    const user = store.user;

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


        const fetchResponse = await api(
            `/notifications/user/${store.user?.email}/current`,
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

    const handleDeleteAll = async () => {
        try {
            await Promise.allSettled(
                liveNotifications.map((n) =>
                    api(`/notifications/${n.notificationId}`, { method: "DELETE" })
                )
            );
            setNotificationsAction([]);
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
    };


    return createPortal(
    <div className="fixed inset-0 z-[999]" onClick={() => setOpenModal(false)}>
        <div className="absolute right-24 top-10 w-[26rem] bg-white rounded shadow-lg border border-grey-200 z-[1000]" role="dialog" aria-label="Notifications" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-3 py-2">
                <h3 className="text-lg font-medium text-black m-0">Your Notifications</h3>
                <div className="flex items-center gap-2">
                    <button
                        className="flex items-center gap-1 text-red text-xs font-medium hover:text-red-dark bg-transparent border-none cursor-pointer"
                        onClick={handleDeleteAll}
                    >
                        <FaTrashAlt />
                        Delete All
                    </button>
                </div>
            </div>

            <div className="max-h-80 overflow-y-auto mt-1.5 [scrollbar-width:none]">
                {liveNotifications && liveNotifications.length > 0 ? (
                    liveNotifications.map((n) => (
                        <GrantNotification 
                        key={n.notificationId}
                        notificationId={n.notificationId}
                        message={n.message}
                        alertTime={n.alertTime}
                        onDelete={handleDelete}
                        avatarUrl={user?.profilePicUrl ?? null}
                        firstName={user?.firstName ?? ''}
                        lastName={user?.lastName ?? ''}
                        />
                    ))
                ) : (
                    <p className="pl-2 pb-2 text-sm text-grey-500">No new notifications</p>
                )}
            </div>
        </div>
    </div>,
        document.body
    );
});

export default NotificationPopup;