import UserPositionCard from "./UserPositionCard";
import { Button, Menu } from "@chakra-ui/react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";

interface ApprovedUserCardProps {
  name: string;
  userId: string;
  email: string;
  position: string;
}

const ApprovedUserCard = ({ name, email, position }: ApprovedUserCardProps) => {
  const handleClickChangePosition = () => {
    // Open modal to confirm position change
  };

  const handleClickDeleteUser = () => {
    // Open modal to confirm user deletion
  };

  return (
    <div className="bg-white text-lg border rounded-md m-6 p-6 flex justify-around items-center">
      <p className="font-semibold w-[140px] text-left">{name}</p>
      <p className="w-[140px] text-left">xxxxxxx</p>
      <p className="w-[140px] text-left">{email}</p>
      <div className="w-[140px]">
        <UserPositionCard position={position} />
      </div>
      <div className="absolute right-14">
        <Menu.Root>
          <Menu.Trigger>
            <Button
              variant="ghost"
              className="focus:outline-none hover:border-none transition-none"
            >
              <FaEllipsisVertical />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Button
                px={4}
                className="text-sm focus:outline-none block w-full bg-[#D3D3D3] border-[#666666] text-[#666666] mb-1"
                onClick={handleClickChangePosition}
              >
                Change to {position === UserStatus.Admin ? "employee" : "admin"}
                {"  "}
                <FontAwesomeIcon icon={faPencil} />
              </Button>
              <Button
                px={4}
                className="text-sm focus:outline-none block w-full bg-[#FFDFDF] border-[#D33221] text-[#D33221]"
                onClick={handleClickDeleteUser}
              >
                Delete user{"  "}
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </div>
    </div>
  );
};

export default ApprovedUserCard;
