import { useState } from "react";
//import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";

import { useAuthContext } from "../../context/auth/authContext";
import { observer } from "mobx-react-lite";
import { UserStatus } from "../../../../middle-layer/types/UserStatus.ts";
import { Navigate } from "react-router-dom";
import Button from "../../components/Button.tsx";
import UserSearch from "./UserSearch.tsx";
import { ProcessUserData } from "./processUserData.ts";
import UserRow from "./user-rows/UserRow.tsx";
import UserMenu from "./user-rows/UserMenu.tsx";
import UserRowHeader from "./user-rows/UserRowHeader.tsx";
import UserApprove from "./user-rows/UserApprove.tsx";

const UsersPage = observer(() => {
  const [showAll, setShowAll] = useState(true);

  const { activeUsers, inactiveUsers } = ProcessUserData();
  //const ITEMS_PER_PAGE = 8;

  const { user } = useAuthContext();

  //const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = showAll ? activeUsers : inactiveUsers;

  // const numUsers = filteredUsers.length;
  // const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // const pageStartIndex = 1; // Temporarily disable pagination by always starting at index 0
  // const pageEndIndex =
  //   pageStartIndex + ITEMS_PER_PAGE > numUsers
  //     ? numUsers
  //     : pageStartIndex + ITEMS_PER_PAGE;
  // const currentPageUsers = filteredUsers.slice(pageStartIndex, pageEndIndex);
  const currentPageUsers = filteredUsers; // Temporarily disable pagination by showing all users
  return user ? (
    user?.position !== UserStatus.Inactive ? (
      <div className="grant-page w-full items-end">
        <UserSearch />
        <div className="flex w-full py-2 gap-2">
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
          <div className="flex flex-col w-full overflow-y-scroll text-start">
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
        {/* Commenting out pagination for now to check if needed */}
        {/* <Pagination.Root
          className="pt-4 mt-auto pb-4"
          count={numUsers}
          pageSize={ITEMS_PER_PAGE}
          page={currentPage}
          onPageChange={(e) => {
            setCurrentPage(e.page);
          }}
        >
          <ButtonGroup variant="ghost" size="md">
            <Pagination.PrevTrigger asChild>
              <IconButton>
                <HiChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>
            <Pagination.Context>
              {({ pages }) =>
                pages.map((page, index) =>
                  page.type === "page" ? (
                    <IconButton
                      key={index}
                      className={
                        currentPage === page.value
                          ? "text-secondary-500 underline"
                          : "ghost"
                      }
                      onClick={() => setCurrentPage(page.value)}
                      aria-label={`Go to page ${page.value}`}
                    >
                      {page.value}
                    </IconButton>
                  ) : (
                    "..."
                  ),
                )
              }
            </Pagination.Context>
            <Pagination.NextTrigger asChild>
              <IconButton>
                <HiChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root> */}
      </div>
    ) : (
      <Navigate to="restricted" replace />
    )
  ) : (
    <Navigate to="/login" replace />
  );
});

export default UsersPage;
