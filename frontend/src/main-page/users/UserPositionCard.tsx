import { useMemo } from "react";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";

interface UserPositionCardProps {
  position: UserStatus;
}

const UserPositionCard = ({ position }: UserPositionCardProps) => {
  const cardStyles = useMemo(() => {
    switch (position) {
      case UserStatus.Admin:
        return "bg-[#BCFFD8] border-green text-green";
      case UserStatus.Employee:
        return "bg-[#FFF8CA] border-yellow text-[#8a710c]";
      case UserStatus.Inactive:
      default:
        return "bg-light-gray-2 border-[#666666] text-[#666666]";
    }
  }, [position]);

  return (
    <div className={`py-1 px-6 rounded-md border ${cardStyles}`}>
      <p className="text-base">{position}</p>
    </div>
  );
};

export default UserPositionCard;
