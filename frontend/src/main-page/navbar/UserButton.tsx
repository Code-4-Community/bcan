import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AccountInfo from "./AccountInfo";
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
        className="user-wrapper relative inline-block p-2 hover:bg-primary-700 rounded-md"
      >
        <button
          className={`user-button ${openModal === "user" ? "hovered" : ""} bg-none border-none relative`}
          onClick={toggleAccountInfo}
        >
          <FontAwesomeIcon className="text-black" icon={faUser} />
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