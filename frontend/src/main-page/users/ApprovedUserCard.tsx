import UserPositionCard from "./UserPositionCard";
import { Button, Menu } from "@chakra-ui/react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import ActionConfirmation from "../../custom/ActionConfirmation";
import { useState } from "react";
import { api } from "../../api";
import { User } from "../../../../middle-layer/types/User";
import { toJS } from "mobx";
import { getAppStore } from "../../external/bcanSatchel/store";

interface ApprovedUserCardProps {
  userId: string;
  email: string;
  position: UserStatus;
}

const ApprovedUserCard = ({
  userId,
  email,
  position,
}: ApprovedUserCardProps) => {
  const store = getAppStore();
  const [isChangeGroupModalOpen, setIsChangeGroupModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);

  const changeUserGroup = async () => {
    console.log(
      `Changing user ${userId} to ${
        position === UserStatus.Admin ? "employee" : "admin"
      }...`
    );

    try {
      const response = await api("/user/change-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            userId,
            email,
            position,
          } as User,
          groupName:
            position === UserStatus.Admin
              ? UserStatus.Employee
              : UserStatus.Admin,
          requestedBy: toJS(store.user) as User,
        }),
      });

      if (response.ok) {
        console.log(
          `User ${userId} successfully changed to ${
            position === UserStatus.Admin ? "employee" : "admin"
          }`
        );
        alert(
          `User ${userId} successfully changed to ${
            position === UserStatus.Admin ? "employee" : "admin"
          }`
        );
        setIsChangeGroupModalOpen(false);
      } else {
        const errorBody = await response.json();
        console.error("Error: ", errorBody)
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
            userId,
            email,
            position,
          } as User,
          requestedBy: toJS(store.user) as User,
        }),
      });

      if (response.ok) {
        console.log(`User ${userId} has been deleted successfully`);
        alert(`User ${userId} has been deleted successfully`);
      } else {
        alert("Failed to delete user");
      }
      setIsDeleteUserModalOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  return (
    <div className="bg-white text-lg border rounded-md m-6 p-6 flex justify-around items-center">
      <ActionConfirmation
        isOpen={isChangeGroupModalOpen}
        onCloseDelete={() => setIsChangeGroupModalOpen(false)}
        onConfirmDelete={changeUserGroup}
        title={`Change User to ${
          position === UserStatus.Admin ? "Employee" : "Admin"
        }`}
        subtitle="Are you sure you want to change to"
        boldSubtitle={position === UserStatus.Admin ? "employee" : "admin"}
        warningMessage={`By changing to ${
          position === UserStatus.Admin ? "employee" : "admin"
        }, they will ${
          position === UserStatus.Admin
            ? "gain access to sensitive data."
            : "lose access to admin pages."
        }`}
      />
      <ActionConfirmation
        isOpen={isDeleteUserModalOpen}
        onCloseDelete={() => setIsDeleteUserModalOpen(false)}
        onConfirmDelete={deleteUser}
        title="Delete User"
        subtitle="Are you sure you want to delete"
        boldSubtitle={userId}
        warningMessage="By deleting this user, they won't be available in the system anymore."
      />
      <p className="font-semibold w-[140px] text-left">{userId}</p>
      <p className="w-[140px] text-left">{email}</p>
      <div className="w-[140px]">
        <UserPositionCard position={position} />
      </div>
      <div className="absolute right-14">
        <Menu.Root>
          <Menu.Trigger>
            <Button
              variant="ghost"
              className="focus:outline-none hover:border-none transition-none"
            >
              <FaEllipsisVertical />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Button
                px={4}
                className="text-sm focus:outline-none block w-full bg-[#D3D3D3] border-[#666666] text-[#666666] mb-1"
                onClick={() => setIsChangeGroupModalOpen(true)}
              >
                Change to {position === UserStatus.Admin ? "employee" : "admin"}
                {"  "}
                <FontAwesomeIcon icon={faPencil} />
              </Button>
              <Button
                px={4}
                className="text-sm focus:outline-none block w-full bg-[#FFDFDF] border-[#D33221] text-[#D33221]"
                onClick={() => setIsDeleteUserModalOpen(true)}
              >
                Delete user{"  "}
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </div>
    </div>
  );
};

export default ApprovedUserCard;
