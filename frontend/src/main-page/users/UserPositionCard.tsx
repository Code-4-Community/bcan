import { useMemo } from "react";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";

interface UserPositionCardProps {
  position: UserStatus;
}

const UserPositionCard = ({ position }: UserPositionCardProps) => {
  const cardStyles = useMemo(() => {
    switch (position) {
      case UserStatus.Admin:
        return "bg-[#BCFFD8] border-[#119548] text-[#119548]";
      case UserStatus.Employee:
        return "bg-[#FFF8CA] border-[#F8CC16] text-[#8a710c]";
      case UserStatus.Inactive:
      default:
        return "bg-[#D3D3D3] border-[#666666] text-[#666666]";
    }
  }, [position]);

  return (
    <div className={`py-1 px-6 rounded-md border ${cardStyles}`}>
      <p className="text-base">{position}</p>
    </div>
  );
};

export default UserPositionCard;
