import { useMemo } from "react";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";

interface UserPositionCardProps {
  position: UserStatus;
}

const UserPositionCard = ({ position }: UserPositionCardProps) => {
  const cardStyles = useMemo(() => {
    switch (position) {
      case UserStatus.Admin:
        return "bg-green-light border-green-dark text-green-dark";
      case UserStatus.Employee:
        return "bg-yellow-light border-yellow text-yellow-dark";
      case UserStatus.Inactive:
      default:
        return "bg-grey-400 border-gray text-gray";
    }
  }, [position]);

  return (
    <div className={`py-1 px-6 rounded-md border ${cardStyles}`}>
      <p className="text-base">{position}</p>
    </div>
  );
};

export default UserPositionCard;
