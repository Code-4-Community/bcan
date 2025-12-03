import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
//import { api } from "../../api"; //todo: swap out dummy data with real api fetch when backend is ready
import NotificationPopup from "../notifications/NotificationPopup";
import { setNotifications as setNotificationsAction } from "../../external/bcanSatchel/actions";
import { getAppStore } from "../../external/bcanSatchel/store";
import { useAuthContext } from "../../context/auth/authContext";
import { observer } from "mobx-react-lite";
import { api } from "../../api";

// get current user id
// const currUserID = sessionStorage.getItem('userId');
// const currUserID = "bcanuser33";

const BellButton =  observer(() => {
   const { user } = useAuthContext();
  // stores notifications for the current user
  const store = getAppStore();
  const notifications = store.notifications ?? [];

  // logs the notifications for the current user whenever they are fetched
  useEffect(() => {
    console.log(notifications);
  }, [notifications]);

  // function that handles when button is clicked and fetches notifications
  const handleClick = async () => {
<<<<<<< HEAD
    // TODO: Remove hardcoded userId after /auth/session endpoint is fixed


    // don't fetch if user isn't logged in (safe fallback)
    //if (!user?.userId) {
      //console.warn("No user logged in, cannot fetch notifications");
      //setClicked(!isClicked);
      //return;
    //}

    try {
      // call backend route
      const response = await api(
        `/notifications/user/${user?.userId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch notifications:", response.statusText);
        // still open popup even if fetch fails (show empty state)
        setClicked(!isClicked);
        return;
      }

      // parse the notifications from response
      const fetchedNotifications = await response.json();

      // update store with fetched notifications 
      setNotificationsAction(fetchedNotifications);

      // toggle popup open
      setClicked(!isClicked);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      //still open popup on error
      setClicked(!isClicked);
    }
    };
=======
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
>>>>>>> 40da3c13631f5a8990f9eaf3ad35eb8498f1ca88

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
