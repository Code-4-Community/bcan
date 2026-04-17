import { createPortal } from "react-dom";
import { useState } from "react";
import GrantNotification from "./GrantNotification";
import { FaTrashAlt } from "react-icons/fa";
import { api } from "../../api";
import { setNotifications as setNotificationsAction } from "../../external/bcanSatchel/actions";
import { Notification } from "../../../../middle-layer/types/Notification";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from "mobx-react-lite";
import ActionConfirmation from "../../components/ActionConfirmation";

type ConfirmState =
  | { kind: "none" }
  | { kind: "one"; id: string; message: string }
  | { kind: "all" };

interface NotificationPopupProps {
  setOpenModal: (open: boolean) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = observer(
  ({ setOpenModal }) => {
    const store = getAppStore();
    const liveNotifications: Notification[] = store.notifications ?? [];
    const user = store.user;
    const [confirm, setConfirm] = useState<ConfirmState>({ kind: "none" });

    const handleDelete = async (notificationId: string) => {
      try {
        const response = await api(`/notifications/${notificationId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          console.error("Failed to delete notification:", response.statusText);
          return;
        }

        const fetchResponse = await api(
          `/notifications/user/${store.user?.email}/current`,
          {
            method: "GET",
          },
        );

        if (fetchResponse.ok) {
          const updatedNotifications = await fetchResponse.json();
          setNotificationsAction(updatedNotifications);
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    };

    const handleDeleteAll = async () => {
      try {
        await Promise.allSettled(
          liveNotifications.map((n) =>
            api(`/notifications/${n.notificationId}`, { method: "DELETE" }),
          ),
        );
        setNotificationsAction([]);
      } catch (error) {
        console.error("Error deleting all notifications:", error);
      }
    };

    const confirmOpen = confirm.kind !== "none";

    return createPortal(
      <>
        <ActionConfirmation
          isOpen={confirmOpen}
          onCloseDelete={() => setConfirm({ kind: "none" })}
          onConfirmDelete={() => {
            if (confirm.kind === "one") {
              void handleDelete(confirm.id);
            } else if (confirm.kind === "all") {
              void handleDeleteAll();
            }
          }}
          title={
            confirm.kind === "all"
              ? "Delete all notifications"
              : "Delete notification"
          }
          subtitle="Are you sure you want to delete"
          boldSubtitle={
            confirm.kind === "all"
              ? "all notifications"
              : confirm.kind === "one"
                ? confirm.message.length > 56
                  ? `${confirm.message.slice(0, 56)}…`
                  : confirm.message
                : ""
          }
          warningMessage={
            confirm.kind === "all"
              ? "Every notification in your list will be permanently removed."
              : "This notification will be permanently removed."
          }
          variant="delete"
        />
    <div className="fixed inset-0 z-[999] bg-black bg-opacity-30" onClick={() => setOpenModal(false)}>
        <div className="absolute end-0 right-6 lg:right-10 top-[4.5rem] w-[26rem] bg-white rounded shadow-lg border border-grey-200 z-[1000] p-1" role="dialog" aria-label="Notifications" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 py-3">
              <h3 className="text-lg font-medium text-black m-0">
                Your Notifications
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 text-red text-xs font-medium hover:text-red-dark bg-transparent border-none cursor-pointer"
                  onClick={() => {
                    if (liveNotifications.length === 0) return;
                    setConfirm({ kind: "all" });
                  }}
                >
                  <FaTrashAlt />
                  Delete All
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto mt-1.5 px-1 [scrollbar-width:none]">
              {liveNotifications && liveNotifications.length > 0 ? (
                liveNotifications.map((n) => (
                  <GrantNotification
                    key={n.notificationId}
                    notificationId={n.notificationId}
                    message={n.message}
                    alertTime={n.alertTime}
                    onRequestDelete={(id) =>
                      setConfirm({
                        kind: "one",
                        id,
                        message: n.message,
                      })
                    }
                    avatarUrl={user?.profilePicUrl ?? null}
                    firstName={user?.firstName ?? ""}
                    lastName={user?.lastName ?? ""}
                  />
                ))
              ) : (
                <p className="pl-2 pb-2 text-sm text-grey-500">
                  No new notifications
                </p>
              )}
            </div>
          </div>
        </div>
      </>,
      document.body,
    );
  },
);

export default NotificationPopup;
