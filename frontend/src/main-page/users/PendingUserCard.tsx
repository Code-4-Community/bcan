import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserPositionCard from "./UserPositionCard";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { api} from "../../api"
import { UserStatus } from "../../../../middle-layer/types/UserStatus";
import { getAppStore } from "../../external/bcanSatchel/store";

interface PendingUserCardProps {
  name: string;
  email: string;
  position: string;
}
const approveUser = async (username : string) => {
  const store = getAppStore();
  try {
    const response = await api("/auth/change-role", { method: 'POST', body: JSON.stringify({
      username: username,
      groupName: "Employee" as UserStatus,
      requestedBy: store.user
        }) });
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }

    const updatedUser = await response.json();
    store.inactiveUsers= store.inactiveUsers.filter((user) => user.userId !== updatedUser.userId);
    store.activeUsers= [...store.activeUsers, updatedUser];
  }
  catch (error) {
    console.error("Error activating user:", error);
  }
}


const deleteUser = async (username : string) => {
    const store = getAppStore();
  try {
    const response = await api("/auth/delete-user", { method: 'POST', body: JSON.stringify({
      username: username,
        }) });
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }

    const updatedUser = await response.json();
    store.inactiveUsers= store.inactiveUsers.filter((user) => user.userId !== updatedUser.userId);
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
        <button className="bg-[#c6fbd3] w-8 h-8 focus:outline-none rounded" onClick={() => approveUser(name)}>
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
