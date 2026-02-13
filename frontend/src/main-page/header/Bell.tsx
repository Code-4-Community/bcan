import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import NotificationPopup from "../notifications/NotificationPopup";
import { setNotifications as setNotificationsAction } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from "mobx-react-lite";
import { api } from "../../api";

// get current user id
// const currUserID = sessionStorage.getItem('userId');
// const currUserID = "bcanuser33";

interface BellButtonProps {
  // onClick handler to open notification popup
  setOpenModal: (modal: string | null) => void;
  openModal: string | null;
}

const BellButton: React.FC<BellButtonProps> = observer(({ setOpenModal, openModal }) => {
  // stores notifications for the current user
  const store = getAppStore();
  const notifications = store.notifications ?? [];

  // logs the notifications for the current user whenever they are fetched
  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

  // function that handles when button is clicked and fetches notifications
  const handleClick = async () => {
    const response = await api(
    `/notifications/user/${store.user?.userId}/current`,
    {
    method: "GET",
    }
    );
    console.log(response);
    const currNotifications = await response.json();
    setNotificationsAction(currNotifications);
    setOpenModal(openModal === "bell" ? null : "bell");
    return notifications;
  };

  return (
    <div className="bell-container">
      <div
        className="bell-wrapper inline-block relative p-2 hover:bg-primary-700 rounded-md"
      >
        <button
          className={`bell-button ${openModal === "bell" ? "hovered" : ""} bg-none border-none relative`}
          onClick={handleClick}
        >
          <FontAwesomeIcon
            icon={faBell} className="text-black"
          />
          {notifications.length > 0 && (
          <span className="absolute top-0 -right-[0.10rem] w-3 h-3 rounded-full bg-red border-2 border-white"
          />
        )}
        </button>

        
      </div>

      {(openModal === "bell" ? (
        <NotificationPopup
          setOpenModal={setOpenModal}
        />
      ) : null)}
    </div>
  );
});

export default BellButton;