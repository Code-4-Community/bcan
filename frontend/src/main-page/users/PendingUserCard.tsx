import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserPositionCard from "./UserPositionCard";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";

interface PendingUserCardProps {
  name: string;
  email: string;
  position: string;
  dateRequested: Date;
}

const PendingUserCard = ({
  name,
  email,
  position,
  dateRequested,
}: PendingUserCardProps) => {
  return (
    <div className="bg-white text-lg border rounded-md m-8 p-6 flex justify-between">
      <p className="font-semibold">{name}</p>
      <p>xxxxxxx</p>
      <p>{email}</p>
      <UserPositionCard position={position} />
      <p>{dateRequested.toLocaleDateString("en-GB")}</p>
      <div className="flex gap-3">
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
