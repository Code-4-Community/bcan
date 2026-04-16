import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import NotificationPopup from "./NotificationPopup";
import { getAppStore } from "../../external/bcanSatchel/store";
import { observer } from "mobx-react-lite";

// get current user id


interface BellButtonProps {
  // onClick handler to open notification popup
  setOpenModal: (open: boolean) => void;
  openModal: boolean;
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
    setOpenModal(!openModal);
  };

  return (
    <div className="bell-container">
      <div
        className="bell-wrapper inline-block relative p-2 rounded-md"
      >
        <button
          className={`bell-button ${openModal ? "hovered" : ""} bg-none border-none relative`}
          onClick={handleClick}
        >
          <FontAwesomeIcon
            icon={faBell} className="text-black hover:text-secondary"
          />
          {notifications.length > 0 && (
          <span className="absolute top-0 -right-[0.10rem] w-3 h-3 rounded-full bg-red border-2 border-white"
          />
        )}
        </button>

        
      </div>

      {(openModal ? (
        <NotificationPopup
          setOpenModal={setOpenModal}
        />
      ) : null)}
    </div>
  );
});

export default BellButton;