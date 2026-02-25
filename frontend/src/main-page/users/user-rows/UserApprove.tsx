import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { User } from "../../../../../middle-layer/types/User";
import { approveUser, deleteUser } from "../UserActions";
import { useState } from "react";
interface UserApproveProps {
  user: User;
}

const UserApprove = ({ user }: UserApproveProps) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex gap-3 w-full">
      <button
        className={`bg-green-light flex-none w-8 h-8 focus:outline-none rounded-sm hover:border-green-dark ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => approveUser(user, setIsLoading)}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faCheck} className="text-green" />
      </button>
      <button
        className={`bg-red-light flex-none w-8 h-8 focus:outline-none rounded-sm hover:border-red-dark ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => deleteUser(user, setIsLoading)}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faX} className="text-red" />
      </button>
    </div>
  );
};

export default UserApprove;
