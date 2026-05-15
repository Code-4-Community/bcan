import { useState } from "react";
//import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";

import { observer } from "mobx-react-lite";
import Button from "../../components/Button.tsx";
import UserSearch from "./components/UserSearch.tsx";
import { ProcessUserData } from "./processUserData.ts";
import UserRow from "./components/UserRow.tsx";
import UserMenu from "./components/UserMenu.tsx";
import UserRowHeader from "./components/UserRowHeader.tsx";
import UserApprove from "./components/UserApprove.tsx";

const UsersPage = observer(() => {
  const [showAll, setShowAll] = useState(true);

  const { activeUsers, inactiveUsers } = ProcessUserData();

  const filteredUsers = showAll ? activeUsers : inactiveUsers;

  const currentPageUsers = filteredUsers // Temporarily disable pagination by showing all users
  return (
    <div className="grant-page w-full min-h-[86vh] items-end">
      <UserSearch />
      <div className="flex w-full py-2 gap-2 text-sm lg:text-base">
        <Button
          text="Active Users"
          onClick={() => setShowAll(true)}
          className={`border-2 ${showAll ? "text-white bg-primary-900" : "bg-white border-grey-500 text-black"}`}
        />
        <div className="relative">
          <Button
            text="Pending Users"
            onClick={() => setShowAll(false)}
            className={`border-2  ${!showAll ? " text-white bg-primary-900" : "bg-white border-grey-500 text-black"}`}
          />
          {inactiveUsers.length > 0 && (
            <span className="absolute top-[0.25rem] right-0 w-3 h-3 rounded-full bg-red border-2 border-white" />
          )}
        </div>
      </div>

      <div className="flex flex-row w-full gap-2 justify-between mt-4 bg-white rounded-md">
        <div className="flex flex-col w-full overflow-y-auto text-start">
          <UserRowHeader />
          {currentPageUsers.map((user) => (
            <div key={user.email}>
              <UserRow
                user={user}
                action={
                  showAll ? (
                    <UserMenu user={user} />
                  ) : (
                    <UserApprove user={user} />
                  )
                }
              />
            </div>
          ))}
          {currentPageUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <p className="text-lg text-gray-500">No users to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default UsersPage;
