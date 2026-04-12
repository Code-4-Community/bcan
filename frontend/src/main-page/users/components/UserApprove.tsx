import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { User } from "../../../../../middle-layer/types/User";
import { approveUser, deleteUser } from "../UserActions";
import { useState } from "react";
import ActionConfirmation from "../../../components/ActionConfirmation";
interface UserApproveProps {
  user: User;
}

const UserApprove = ({ user }: UserApproveProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState(false);

  return (
    <div className="flex gap-3 w-full">
      <ActionConfirmation
        isOpen={isApproveModalOpen}
        onCloseDelete={() => setIsApproveModalOpen(false)}
        onConfirmDelete={() => approveUser(user, setIsLoading)}
        title="Approve User"
        subtitle="Are you sure you want to approve"
        boldSubtitle={user.email}
        warningMessage="Approving this user grants access to the application."
        variant="create"
      />
      <ActionConfirmation
        isOpen={isDenyModalOpen}
        onCloseDelete={() => setIsDenyModalOpen(false)}
        onConfirmDelete={() => deleteUser(user, setIsLoading)}
        title="Deny User"
        subtitle="Are you sure you want to deny"
        boldSubtitle={user.email}
        warningMessage="Denying this user will remove their pending access request."
        variant="delete"
      />
      <button
        className={`bg-green-light flex-none w-8 h-8 focus:outline-none rounded-sm hover:border-green-dark ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => setIsApproveModalOpen(true)}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faCheck} className="text-green" />
      </button>
      <button
        className={`bg-red-light flex-none w-8 h-8 focus:outline-none rounded-sm hover:border-red-dark ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => setIsDenyModalOpen(true)}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faX} className="text-red" />
      </button>
    </div>
  );
};

export default UserApprove;
