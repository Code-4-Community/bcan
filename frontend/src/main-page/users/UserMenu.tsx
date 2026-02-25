import { Menu } from "@chakra-ui/react";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";
import { faUserPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import ActionConfirmation from "../../custom/ActionConfirmation";
import { useState } from "react";
import { api } from "../../api";
import { User } from "../../../../middle-layer/types/User";
import { toJS } from "mobx";
import { getAppStore } from "../../external/bcanSatchel/store";
import { setActiveUsers } from "../../external/bcanSatchel/actions";
import Button from "../../components/Button";
import { FaEllipsis } from "react-icons/fa6";

interface UserMenuProps {
  user: User;
}

const UserMenu = ({ user }: UserMenuProps) => {
  const store = getAppStore();
  const [isChangeGroupModalOpen, setIsChangeGroupModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);

  const changeUserGroup = async () => {
    console.log(
      `Changing user ${user.email} to ${
        user.position === UserStatus.Admin ? "employee" : "admin"
      }...`,
    );

    try {
      const response = await api("/user/change-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            email: user.email,
            position: user.position,
          } as User,
          groupName:
            user.position === UserStatus.Admin
              ? UserStatus.Employee
              : UserStatus.Admin,
          requestedBy: toJS(store.user) as User,
        }),
      });

      if (response.ok) {
        console.log(
          `User ${user.email} successfully changed to ${
            user.position === UserStatus.Admin ? "employee" : "admin"
          }`,
        );
        alert(
          `User ${user.email} successfully changed to ${
            user.position === UserStatus.Admin ? "employee" : "admin"
          }`,
        );
        const updatedUser = await response.json();
        setActiveUsers([
          ...store.activeUsers.filter((u) => u.email !== user.email),
          updatedUser as User,
        ]);

        setIsChangeGroupModalOpen(false);
      } else {
        const errorBody = await response.json();
        console.error("Error: ", errorBody);
      }
    } catch (error) {
      console.error("Error changing user group: ", error);
    }
  };

  const deleteUser = async () => {
    try {
      const response = await api("user/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            email: user.email,
            position: user.position,
          } as User,
          requestedBy: toJS(store.user) as User,
        }),
      });

      if (response.ok) {
        console.log(`User ${user.email} has been deleted successfully`);
        alert(`User ${user.email} has been deleted successfully`);
        setActiveUsers(store.activeUsers.filter((u) => u.email !== user.email));
      } else {
        const errorBody = await response.json();
        console.error("Error: ", errorBody);
        alert("Failed to delete user");
      }
      setIsDeleteUserModalOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  return (
    <div key={user.email} className="w-full">
      <ActionConfirmation
        isOpen={isChangeGroupModalOpen}
        onCloseDelete={() => setIsChangeGroupModalOpen(false)}
        onConfirmDelete={changeUserGroup}
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
        onConfirmDelete={deleteUser}
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
                  alignment="left"
                  logo={faUserPen}
                  logoPosition="left"
                  onClick={() => setIsChangeGroupModalOpen(true)}
                  className="text-sm focus:outline-none block w-full hover:border-grey-800 active:bg-grey-800 text-grey-800"
                />
                <hr className="border-t-1 border-grey-400 my-1 mx-2"></hr>
                <Button
                  text={"Delete user  "}
                  logo={faTrash}
                  logoPosition="left"
                  alignment="left"
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
