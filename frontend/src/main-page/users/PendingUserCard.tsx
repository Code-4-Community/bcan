import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserPositionCard from "./UserPositionCard";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";

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
  return (
    <div className="bg-white text-lg border rounded-md m-6 p-6 flex justify-around items-center">
      <p className="font-semibold w-[140px] text-left">{name}</p>
      <p className="w-[140px] text-left">xxxxxxx</p>
      <p className="w-[140px] text-left">{email}</p>
      <div className="w-[140px]">
        <UserPositionCard position={position} />
      </div>
      <div className="flex w-[140px] gap-3">
        <button className="bg-[#c6fbd3] w-8 h-8 focus:outline-none rounded">
          <FontAwesomeIcon icon={faCheck} style={{ color: "black" }} />
        </button>
        <button className="bg-[#fe9d92] w-8 h-8 focus:outline-none rounded">
          <FontAwesomeIcon icon={faX} style={{ color: "black" }} />
        </button>
      </div>
    </div>
  );
};

export default PendingUserCard;
