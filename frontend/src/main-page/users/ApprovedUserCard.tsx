import UserPositionCard from "./UserPositionCard";

interface ApprovedUserCardProps {
  name: string;
  email: string;
  position: string;
}

const ApprovedUserCard = ({ name, email, position }: ApprovedUserCardProps) => {
  return (
    <div className="bg-white text-lg border rounded-md m-8 p-6 flex justify-around items-center">
      <p className="font-semibold w-[140px] text-left">{name}</p>
      <p className="w-[140px] text-left">xxxxxxx</p>
      <p className="w-[140px] text-left">{email}</p>
      <div className="w-[140px]">
        <UserPositionCard position={position} />
      </div>
    </div>
  );
};

export default ApprovedUserCard;
