import { User } from "../../../../middle-layer/types/User";
import UserPositionCard from "./UserPositionCard";
import logo from "../../images/logo.svg";

// Did not change this to using the email/first name last name due to user page redesign so someone will be changing all of this anyway
interface UserRowProps {
  user: User;
  action: React.ReactNode;
}
const UserRow = ({ user, action }: UserRowProps) => {
  return (
    <div
      key={user.email}
      className="grid grid-cols-2 md:grid-cols-[30%_35%_25%_10%] cols gap-2 md:gap-0 text-sm lg:text-base border-b-2 border-grey-150 py-4 px-8 items-center"
    >
      <div className="col-span-1 flex items-center font-medium">
        <img
          src={logo}
          alt="Profile"
          className="max-w-12 mr-4 rounded-full hidden lg:block"
        />
        {user.firstName}&nbsp;{user.lastName}
      </div>
      <div className="col-span-1">{user.email}</div>
      <div className="col-span-1">
        <UserPositionCard position={user.position} />
      </div>
      <div className="col-span-1">{action}</div>
    </div>
  );
};

export default UserRow;
