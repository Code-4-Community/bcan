import { Menu } from "@chakra-ui/react";
import { UserStatus } from "../../../../../middle-layer/types/UserStatus";
import { faUserPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import ActionConfirmation from "../../../custom/ActionConfirmation";
import { useState } from "react";
import { User } from "../../../../../middle-layer/types/User";
import Button from "../../../components/Button";
import { FaEllipsis } from "react-icons/fa6";
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
        boldSubtitle={user.position === UserStatus.Admin ? "employee" : "admin"}
        warningMessage={`By changing to ${
          user.position === UserStatus.Admin ? "employee" : "admin"
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
      <div className="">
        <Menu.Root>
          <Menu.Trigger>
            <div className="p-2 border-0  cursor-pointerchakra">
              <FaEllipsis />
            </div>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content className="bg-white rounded-md shadow-lg border-grey-500 border-1">
              <div className="text-left justify-start">
                <Button
                  text={
                    "Change to " +
                    (user.position === UserStatus.Admin
                      ? "employee"
                      : "admin") +
                    "  "
                  }
                  logo={faUserPen}
                  logoPosition="left"
                  onClick={() => setIsChangeGroupModalOpen(true)}
                  disabled={isChangeGroupModalOpen || isDeleteUserModalOpen}
                  className="text-sm focus:outline-none block w-full hover:border-grey-800 active:bg-grey-800 text-grey-800"
                />
                <hr className="border-t-1 border-grey-400 my-1 mx-2"></hr>
                <Button
                  text={"Delete user  "}
                  logo={faTrash}
                  logoPosition="left"
                  disabled={isChangeGroupModalOpen || isDeleteUserModalOpen}
                  onClick={() => setIsDeleteUserModalOpen(true)}
                  className="text-sm focus:outline-none block w-full hover:border-red active:bg-red text-red"
                />
              </div>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </div>
    </div>
  );
};

export default UserMenu;
