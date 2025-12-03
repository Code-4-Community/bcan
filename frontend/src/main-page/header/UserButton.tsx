import { useState } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AccountInfo from "./AccountInfo";

import "./styles/UserButton.css";
import { useAuthContext } from "../../context/auth/authContext";

interface UserButtonProps {
  setOpenModal: (modal: string | null) => void;
  openModal: string | null;
}

const UserButton: React.FC<UserButtonProps> = ({ setOpenModal, openModal }) => {
  const { user } = useAuthContext();
  const toggleAccountInfo = () => {
    setOpenModal(openModal === "user" ? null : "user");
  };
  

  return (
    <div className="user-container">
      <div
        className="user-wrapper"
        style={{ position: "relative", display: "inline-block" }}
      >
        <button
          className={`user-button ${openModal === "user" ? "hovered" : ""}`}
          onClick={toggleAccountInfo}
          style={{ background: "none", position: "relative" }}
        >
          <FontAwesomeIcon icon={faUser} style={{ color: "black" }} />
        </button>

        {openModal === "user" && (
          <AccountInfo
            email={user?.email ?? ""}
            username={user?.userId ?? ""}
            role={user?.position ?? ""}
            setOpenModal={setOpenModal}
          />
        )}
      </div>
    </div>
  );
};

export default UserButton;