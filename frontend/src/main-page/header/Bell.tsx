import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
//import { api } from "../../api"; //todo: swap out dummy data with real api fetch when backend is ready
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
    //temporary dummy data for now
    // const dummyNotifications = [
    //   {
    //     id: 1,
    //     title: "Grant Deadline",
    //     message: "Grant A deadline approaching in 3 days",
    //   },
    //   { id: 2, title: "Grant Deadline", message: "Grant B deadline tomorrow!" },
    //   {
    //     id: 3,
    //     title: "Grant Deadline",
    //     message: "Grant C deadline passed yesterday!",
    //   },
    //   { id: 4, title: "Grant Deadline", message: "Grant D deadline tomorrow!" },
    // ];
    const response = await api(
    `/notifications/user/${store.user?.userId}`,
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
        className="bell-wrapper"
        style={{ position: "relative", display: "inline-block" }}
      >
        <button
          className={`bell-button ${openModal === "bell" ? "hovered" : ""}`}
          onClick={handleClick}
          style={{ background: "none", position: "relative" }}
        >
          <FontAwesomeIcon
            icon={faBell}
            style={{ color: "black"}}
          />
        </button>

        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0px",
              right: "0px",
              width: "10px",
              height: "10px",
              backgroundColor: "red",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
        )}
      </div>

      {(openModal === "bell" ? (
        <NotificationPopup
          notifications={notifications}
          setOpenModal={setOpenModal}
        />
      ) : null)}
    </div>
  );
});

export default BellButton;
