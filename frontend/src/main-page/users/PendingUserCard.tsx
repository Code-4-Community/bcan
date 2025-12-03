import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserPositionCard from "./UserPositionCard";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { api } from "../../api"
import { UserStatus } from "../../../../middle-layer/types/UserStatus";
import { getAppStore } from "../../external/bcanSatchel/store";
import { User } from "../../../../middle-layer/types/User";
import { toJS } from "mobx";
import { moveUserToActive, removeUser } from "./UserActions";
import { useState } from "react";


const store = getAppStore();

interface PendingUserCardProps {
  name: string;
  email: string;
  position: string;
}


const PendingUserCard = ({
  name,
  email,
  position,
}: PendingUserCardProps) => {

  const [isLoading, setIsLoading] = useState(false);

  const approveUser = async () => {
    setIsLoading(true);
    try {
      const response = await api("/user/change-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            userId: name,
            email: email,
            position: position as UserStatus,
          } as User,
          groupName: "Employee",
          requestedBy: toJS(store.user) as User,
        }),
      });
      if (response.ok) {
        alert(`User ${name} has been approved successfully`);
        const body = await response.json();
        moveUserToActive(body as User)
      } else {
        alert("Failed to approve user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Error approving user");
    } finally {
      setIsLoading(false);
    }
  };

  const rejectUser = async () => {
    setIsLoading(true);
    try {
      const response = await api("user/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            userId: name,
            email: email,
            position: position as UserStatus,
          } as User,
          requestedBy: toJS(store.user) as User,
        }),
      });
      if (response.ok) {
        alert(`User ${name} has been deleted successfully`);
        const body = await response.json();
        removeUser(body)
      } else {
        alert("Failed to reject user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Error rejecting user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white text-lg border rounded-md m-6 p-6 flex justify-around items-center">
      <p className="font-semibold w-[140px] text-left">{name}</p>
      <p className="w-[140px] text-left">xxxxxxx</p>
      <p className="w-[140px] text-left">{email}</p>
      <div className="w-[140px]">
        <UserPositionCard position={position} />
      </div>
      <div className="flex w-[140px] gap-3">
        <button 
          className="bg-[#c6fbd3] w-8 h-8 focus:outline-none rounded"
          onClick={approveUser}
          disabled={isLoading}>
          <FontAwesomeIcon icon={faCheck} style={{ color: "black" }} />
        </button>
        <button 
        className="bg-[#fe9d92] w-8 h-8 focus:outline-none rounded"
          onClick={rejectUser}
          disabled={isLoading}>
          <FontAwesomeIcon icon={faX} style={{ color: "black" }} />
        </button>
      </div>
    </div>
  );
};

export default PendingUserCard;
