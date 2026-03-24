import { UserStatus } from "../../../../../middle-layer/types/UserStatus";
import { faUserPen, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActionConfirmation from "../../../components/ActionConfirmation";
import { useState } from "react";
import { User } from "../../../../../middle-layer/types/User";
import { changeUserGroup, deleteUser } from "../UserActions";

interface UserMenuProps {
  user: User;
}

const UserMenu = ({ user }: UserMenuProps) => {
  const [isChangeGroupModalOpen, setIsChangeGroupModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);

  return (
    <div key={user.email} className="w-full">
      <ActionConfirmation
        isOpen={isChangeGroupModalOpen}
        onCloseDelete={() => setIsChangeGroupModalOpen(false)}
        onConfirmDelete={() => changeUserGroup(user)}
        title={`Change User to ${
          user.position === UserStatus.Admin ? "Employee" : "Admin"
        }`}
        subtitle="Are you sure you want to change to"
        boldSubtitle={user.position === UserStatus.Admin ? "Employee" : "Admin"}
        warningMessage={`By changing to ${
          user.position === UserStatus.Admin ? "Employee" : "Admin"
        }, they will ${
          user.position === UserStatus.Admin
            ? "lose access to sensitive data."
            : "gain access to admin pages."
        }`}
      />
      <ActionConfirmation
        isOpen={isDeleteUserModalOpen}
        onCloseDelete={() => setIsDeleteUserModalOpen(false)}
        onConfirmDelete={() => deleteUser(user, () => {})}
        title="Delete User"
        subtitle="Are you sure you want to delete"
        boldSubtitle={user.email}
        warningMessage="By deleting this user, they won't be available in the system anymore."
      />
      <div className="flex items-center justify-end gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsChangeGroupModalOpen(true)}
            disabled={isChangeGroupModalOpen || isDeleteUserModalOpen}
            aria-label={
              user.position === UserStatus.Admin
                ? "Assign Employee"
                : "Assign Admin"
            }
            className="group flex h-8 items-center gap-2 overflow-hidden rounded-sm border-0 bg-grey-100 px-2 outline-none shadow-none transition-all hover:border-0 hover:bg-grey-200 hover:shadow-none focus:border-0 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon
              icon={faUserPen}
              className={
                user.position === UserStatus.Admin
                  ? "text-yellow-dark"
                  : "text-green-dark"
              }
            />
            <span
              className={`max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-200 group-hover:max-w-[120px] group-hover:opacity-100 group-focus-visible:max-w-[120px] group-focus-visible:opacity-100 ${
                user.position === UserStatus.Admin
                  ? "text-yellow-dark"
                  : "text-green-dark"
              }`}
            >
              {user.position === UserStatus.Admin
                ? "Assign Employee"
                : "Assign Admin"}
            </span>
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDeleteUserModalOpen(true)}
            disabled={isChangeGroupModalOpen || isDeleteUserModalOpen}
            aria-label="Delete user"
            className="h-8 w-8 rounded-md border-0 bg-grey-100 text-red-dark outline-none shadow-none transition-colors hover:border-0 hover:bg-grey-200 hover:shadow-none focus:border-0 focus:outline-none focus:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
