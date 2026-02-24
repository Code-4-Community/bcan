import { useState } from "react";
import { useAuthContext } from "../../context/auth/authContext";
import { observer } from "mobx-react-lite";
import { UserStatus } from "../../../../middle-layer/types/UserStatus.ts";
import { Navigate } from "react-router-dom";
import Button from "../../components/Button.tsx";
import UserSearch from "./UserSearch.tsx";
import { ProcessUserData } from "./processUserData.ts";

const UsersPage = observer(() => {
  const [showAll, setShowAll] = useState(true);

  const { activeUsers, inactiveUsers } = ProcessUserData();
  const ITEMS_PER_PAGE = 8;

  const { user } = useAuthContext();

  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = showAll ? activeUsers : inactiveUsers;

  const numInactiveUsers = inactiveUsers.length;
  const numUsers = filteredUsers.length;
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEndIndex =
    pageStartIndex + ITEMS_PER_PAGE > numUsers
      ? numUsers
      : pageStartIndex + ITEMS_PER_PAGE;
  const currentPageUsers = filteredUsers.slice(pageStartIndex, pageEndIndex);

  return user ? (
    user?.position !== UserStatus.Inactive ? (
      <div className="grant-page w-full items-end">
        <UserSearch />
        <div className="flex w-full py-2 gap-2">
          <Button
            text="All Users"
            onClick={() => setShowAll(true)}
            className={`border-2 ${showAll ? "text-white bg-primary-900" : "bg-white border-grey-500 text-black"}`}
          />
          <div>
          <Button
            text="Pending Users"
            onClick={() => setShowAll(false)}
            className={`relative border-2  ${!showAll ? " text-white bg-primary-900" : "bg-white border-grey-500 text-black"}`}
          />
          {inactiveUsers.length > 0 && (
          <span className="absolute top-24 left-[31.8rem] w-3 h-3 rounded-full bg-red border-2 border-white"
          />
        )}
          </div>
        </div>

        <div className="flex flex-row w-full gap-2 justify-between mt-4">
          <div className="flex flex-col w-full overflow-y-scroll pr-2">
            {currentPageUsers.map((user) => (
              <div>{user.email}</div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <Navigate to="restricted" replace />
    )
  ) : (
    <Navigate to="/login" replace />
  );
});

export default UsersPage;
