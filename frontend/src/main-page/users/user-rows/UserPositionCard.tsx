import { useMemo } from "react";
import { UserStatus } from "../../../../../middle-layer/types/UserStatus";

interface UserPositionCardProps {
  position: UserStatus;
}

const UserPositionCard = ({ position }: UserPositionCardProps) => {
  const cardStyles = useMemo(() => {
    switch (position) {
      case UserStatus.Admin:
        return "bg-green-light border-green-dark text-green-dark";
      case UserStatus.Employee:
        return "bg-yellow-light border-yellow-dark text-yellow-dark";
      case UserStatus.Inactive:
      default:
        return "bg-grey-400 border-grey text-grey-700";
    }
  }, [position]);

  return (
    <div className={`inline-flex w-fit flex-none items-center rounded-full px-3 py-1 ${cardStyles}`}>
      <p className="text-medium">{position}</p>
    </div>
  );
};

export default UserPositionCard;
