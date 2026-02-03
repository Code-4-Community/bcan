import { useEffect, useState } from "react";
import ApprovedUserCard from "./ApprovedUserCard";
import PendingUserCard from "./PendingUserCard";
import { User } from "../../../../middle-layer/types/User";
import { Pagination, ButtonGroup, IconButton } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { observer } from "mobx-react-lite";
import { getAppStore } from "../../external/bcanSatchel/store";
import { api } from "../../api";
import { Navigate } from "react-router-dom";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";
import { useAuthContext } from "../../context/auth/authContext";

// Represents a specific tab to show on the user page
enum UsersTab {
  PendingUsers,
  CurrentUsers,
}

const fetchActiveUsers = async (): Promise<User[]> => {
  try {
    const response = await api("/user/active", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }

    const activeUsers = await response.json();
    return activeUsers as User[];
  } catch (error) {
    console.error("Error fetching active users:", error);
    return []; // Return empty array on error
  }
};

const fetchInactiveUsers = async () => {
  try {
    const response = await api("/user/inactive", { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const inactiveUsers = await response.json();
    return inactiveUsers as User[];
  } catch (error) {
    console.error("Error fetching active users:", error);
  }
};

const ITEMS_PER_PAGE = 8;

const Users = observer(() => {
  const store = getAppStore();
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchUsers = async () => {
      const active = await fetchActiveUsers();
      const inactive = await fetchInactiveUsers();
      if (active) {
        store.activeUsers = active;
      }
      if (inactive) {
        store.inactiveUsers = inactive;
      }
    };
    fetchUsers();
  }, []);

  const [usersTabStatus, setUsersTabStatus] = useState<UsersTab>(
    UsersTab.CurrentUsers
  );
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers =
    usersTabStatus === UsersTab.PendingUsers
      ? store.inactiveUsers
      : store.activeUsers;

  const numInactiveUsers = store.inactiveUsers.length;
  const numUsers = filteredUsers.length;
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEndIndex =
    pageStartIndex + ITEMS_PER_PAGE > numUsers
      ? numUsers
      : pageStartIndex + ITEMS_PER_PAGE;
  const currentPageUsers = filteredUsers.slice(pageStartIndex, pageEndIndex);

  return user ? (
    user?.position !== UserStatus.Inactive ? (
      <div className="p-8">
        <div className="text-left mb-5">
          <h1 className="font-medium text-4xl">
            {usersTabStatus === UsersTab.CurrentUsers
              ? "All Users"
              : "Pending Users"}
          </h1>
          <p className="text-[#FF8476]">{numInactiveUsers} new users</p>
        </div>
        <div className="min-h-screen bg-[#F5F4F4] border rounded-md relative flex flex-col">
          <div className="absolute right-7 top-0 -translate-y-full flex">
            <button
              className={`w-52 h-16 border rounded-b-none focus:outline-none ${
                usersTabStatus === UsersTab.PendingUsers
                  ? "bg-[#F5F4F4] border-x-black border-t-black"
                  : "bg-[#F4F4F4] border-x-[#BFBBBB] border-t-[#BFBBBB] border-b-black"
              }`}
              onClick={() => {
                setUsersTabStatus(UsersTab.PendingUsers);
                setCurrentPage(1);
              }}
            >
              Pending Users
            </button>
            <button
              className={`w-52 h-16 border rounded-b-none ml-2 focus:outline-none ${
                usersTabStatus === UsersTab.CurrentUsers
                  ? "bg-[#F5F4F4] border-x-black border-t-black"
                  : "bg-[#F4F4F4] border-x-[#BFBBBB] border-t-[#BFBBBB] border-b-black"
              }`}
              onClick={() => {
                setUsersTabStatus(UsersTab.CurrentUsers);
                setCurrentPage(1);
              }}
            >
              Current Users
            </button>
          </div>
          <div>
            {usersTabStatus === UsersTab.CurrentUsers ? (
              <>
                <div className="flex px-9 pb-3 m-7 border-b border-b-[#BFBBBB] font-semibold justify-around">
                  <p className="w-[140px] text-left">User ID</p>
                  <p className="w-[140px] text-left">Email</p>
                  <p className="w-[140px] text-left">Position</p>
                </div>
                {currentPageUsers.map((user) => (
                  <ApprovedUserCard
                    key={user.userId}
                    userId={user.userId}
                    email={user.email}
                    position={user.position}
                  />
                ))}
              </>
            ) : (
              <>
                <div className="flex px-9 pb-3 m-7 border-b border-b-[#BFBBBB] font-semibold justify-around">
                  <p className="w-[140px] text-left">User ID</p>
                  <p className="w-[140px] text-left">Email</p>
                  <p className="w-[140px] text-left">Position</p>
                  <div className="w-[140px]"></div>
                </div>
                {currentPageUsers.map((user) => (
                  <PendingUserCard
                    key={user.userId}
                    userId={user.userId}
                    email={user.email}
                    position={user.position}
                  />
                ))}
              </>
            )}
          </div>
          <Pagination.Root
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
                            ? "text-dark-blue underline"
                            : "ghost"
                        }
                        onClick={() => setCurrentPage(page.value)}
                        aria-label={`Go to page ${page.value}`}
                      >
                        {page.value}
                      </IconButton>
                    ) : (
                      "..."
                    )
                  )
                }
              </Pagination.Context>
              <Pagination.NextTrigger asChild>
                <IconButton>
                  <HiChevronRight />
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        </div>
      </div>
    ) : (
      <Navigate to="restricted" replace />
    )
  ) : (
    <Navigate to="/login" replace />
  );
});

export default Users;
