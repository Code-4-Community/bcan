import UserPositionCard from "./UserPositionCard";

interface ApprovedUserCardProps {
  name: string;
  email: string;
  position: string;
}

const ApprovedUserCard = ({ name, email, position }: ApprovedUserCardProps) => {
  return (
    <div className="bg-white text-lg border rounded-md m-8 p-6 flex justify-left gap-80">
      <p className="font-semibold">{name}</p>
      <p>xxxxxxx</p>
      <p>{email}</p>
      <UserPositionCard position={position} />
    </div>
  );
};

export default ApprovedUserCard;
