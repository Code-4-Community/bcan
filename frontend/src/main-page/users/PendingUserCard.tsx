import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserPositionCard from "./UserPositionCard";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { api } from "../../api"
import { UserStatus } from "../../../../middle-layer/types/UserStatus";
import { getAppStore } from "../../external/bcanSatchel/store";
import { User } from "../../../../middle-layer/types/User";
import { toJS } from "mobx";
import { moveUserToActive } from "./UserActions";

interface PendingUserCardProps {
  name: string;
  email: string;
  position: string;
}
const approveInactiveUser = async (user: User) => {
  const store = getAppStore();
  console.log("Approving user:", user);
  console.log("requested user", store.user);
  try {
    const body = JSON.stringify({
      user: user as User,
      groupName: "Employee" as UserStatus,
      requestedBy: toJS(store.user)
    })
    console.log("Request body:", body);
    const response = await api("/user/change-role", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  // ← Add this!
      }, body: body
    });
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }

    const updatedUser = await response.json();
    moveUserToActive(updatedUser);
  }
  catch (error) {
    console.error("Error activating user:", error);
  }
}


const deleteUser = async (username: string) => {
  const store = getAppStore();
  try {
    const response = await api("/auth/delete-user", {
      method: 'POST', body: JSON.stringify({
        username: username,
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }

    const updatedUser = await response.json();
    store.inactiveUsers = store.inactiveUsers.filter((user) => user.userId !== updatedUser.userId);
  }
  catch (error) {
    console.error("Error activating user:", error);
  }
}


const PendingUserCard = ({
  name,
  email,
  position,
}: PendingUserCardProps) => {
  return (
    <div className="bg-white text-lg border rounded-md m-6 p-6 flex justify-around items-center">
      <p className="font-semibold w-[140px] text-left">{name}</p>
      <p className="w-[140px] text-left">xxxxxxx</p>
      <p className="w-[140px] text-left">{email}</p>
      <div className="w-[140px]">
        <UserPositionCard position={position} />
      </div>
      <div className="flex w-[140px] gap-3">
        <button className="bg-[#c6fbd3] w-8 h-8 focus:outline-none rounded" onClick={() => approveInactiveUser({ userId: name, email: email, position: position as UserStatus } as User)}>
          <FontAwesomeIcon icon={faCheck} style={{ color: "black" }} />
        </button>
        <button className="bg-[#fe9d92] w-8 h-8 focus:outline-none rounded" onClick={() => deleteUser(name)}>
          <FontAwesomeIcon icon={faX} style={{ color: "black" }} />
        </button>
      </div>
    </div>
  );
};

export default PendingUserCard;
