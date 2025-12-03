import { useState } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AccountInfo from "./AccountInfo";

import "./styles/UserButton.css";
import { useAuthContext } from "../../context/auth/authContext";


const UserButton = () => {
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const { user } = useAuthContext();
  const toggleAccountInfo = () => {
    setShowAccountInfo(!showAccountInfo);
  };
  

  return (
    <div className="user-container">
      <div
        className="user-wrapper"
        style={{ position: "relative", display: "inline-block" }}
      >
        <button
          className={`user-button ${showAccountInfo ? "hovered" : ""}`}
          onClick={toggleAccountInfo}
          style={{ background: "none", position: "relative" }}
        >
          <FontAwesomeIcon icon={faUser} style={{ color: "black" }} />
        </button>

        {showAccountInfo && (
          <AccountInfo
            email={user?.email ?? ""}
            username={user?.userId ?? ""}
            role={user?.position ?? ""}
            setShowAccountInfo={setShowAccountInfo}
          />
        )}
      </div>
    </div>
  );
};

export default UserButton;