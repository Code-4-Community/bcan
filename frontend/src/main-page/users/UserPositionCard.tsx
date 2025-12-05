import { useMemo } from "react";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";

interface UserPositionCardProps {
  position: string;
}

const UserPositionCard = ({ position }: UserPositionCardProps) => {
  const cardStyles = useMemo(() => {
    switch (position.toLowerCase()) {
      case "Admin" as UserStatus:
        return "bg-[#BCFFD8] border-[#119548] text-[#119548]";
      case "Employee"  as UserStatus:
        return "bg-[#FFF8CA] border-[#F8CC16] text-[#8a710c]";
      case "deactive":
        return "bg-[#FFB0B0] border-[#DF0404] text-[#DF0404]";
      case "Inactive"  as UserStatus:
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
