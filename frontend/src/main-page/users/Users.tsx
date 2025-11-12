import { useState } from "react";
import ApprovedUserCard from "./ApprovedUserCard";
import PendingUserCard from "./PendingUserCard";
import { User } from "../../../../middle-layer/types/User";
import { Pagination, ButtonGroup, IconButton } from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

// Represents a specific tab to show on the user page
enum UsersTab {
  PendingUsers,
  CurrentUsers,
}

const mockUsers: User[] = [
  {
    userId: "id1",
    position: "Admin",
    email: "email1",
    name: "name1",
  },
  {
    userId: "id2",
    position: "Employee",
    email: "email2",
    name: "name2",
  },
  {
    userId: "id3",
    position: "Inactive",
    email: "email3",
    name: "name3",
  },
  {
    userId: "id4",
    position: "Admin",
    email: "email4",
    name: "name4",
  },
  {
    userId: "id5",
    position: "Employee",
    email: "email5",
    name: "name5",
  },
  {
    userId: "id6",
    position: "Inactive",
    email: "email6",
    name: "name6",
  },
  {
    userId: "id7",
    position: "Admin",
    email: "email7",
    name: "name7",
  },
  {
    userId: "id8",
    position: "Employee",
    email: "email8",
    name: "name8",
  },
  {
    userId: "id9",
    position: "Inactive",
    email: "email9",
    name: "name9",
  },
  {
    userId: "id10",
    position: "Admin",
    email: "email10",
    name: "name10",
  },
  {
    userId: "id11",
    position: "Employee",
    email: "email11",
    name: "name11",
  },
  {
    userId: "id12",
    position: "Admin",
    email: "email12",
    name: "name12",
  },
];

const ITEMS_PER_PAGE = 8;

function Users() {
  const [usersTabStatus, setUsersTabStatus] = useState<UsersTab>(
    UsersTab.CurrentUsers
  );
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers =
    usersTabStatus === UsersTab.PendingUsers
      ? mockUsers.filter((user) => user.position === "Inactive")
      : mockUsers.filter((user) => user.position !== "Inactive");

  const numUsers = filteredUsers.length;
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEndIndex =
    pageStartIndex + ITEMS_PER_PAGE > numUsers
      ? numUsers
      : pageStartIndex + ITEMS_PER_PAGE;
  const currentPageUsers = filteredUsers.slice(pageStartIndex, pageEndIndex);

  return (
    <div className="p-8">
      <div className="text-left mb-5">
        <h1 className="font-medium text-4xl">
          {usersTabStatus === UsersTab.CurrentUsers
            ? "All Users"
            : "Pending Users"}
        </h1>
        <p className="text-[#FF8476]"># new users</p>
      </div>
      <div className="min-h-screen bg-[#F5F4F4] border rounded-md relative">
        <div className="absolute right-7 top-0 -translate-y-full flex">
          <button
            className={`w-52 h-16 border rounded-b-none focus:outline-none ${
              usersTabStatus === UsersTab.PendingUsers
                ? "bg-[#F5F4F4] border-x-[#000000] border-t-[#000000]"
                : "bg-[#F4F4F4] border-x-[#BFBBBB] border-t-[#BFBBBB] border-b-[#000000]"
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
                ? "bg-[#F5F4F4] border-x-[#000000] border-t-[#000000]"
                : "bg-[#F4F4F4] border-x-[#BFBBBB] border-t-[#BFBBBB] border-b-[#000000]"
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
                <p className="w-[140px] text-left">User Name</p>
                <p className="w-[140px] text-left">User ID</p>
                <p className="w-[140px] text-left">Email</p>
                <p className="w-[140px] text-left">Position</p>
              </div>
              {currentPageUsers.map((user) => (
                <ApprovedUserCard
                  key={user.userId}
                  name={user.name}
                  email={user.email}
                  position={user.position}
                />
              ))}
            </>
          ) : (
            <>
              <div className="flex px-9 pb-3 m-7 border-b border-b-[#BFBBBB] font-semibold justify-around">
                <p className="w-[140px] text-left">User Name</p>
                <p className="w-[140px] text-left">User ID</p>
                <p className="w-[140px] text-left">Email</p>
                <p className="w-[140px] text-left">Position</p>
                <div className="w-[140px]"></div>
              </div>
              {currentPageUsers.map((user) => (
                <PendingUserCard
                name={user.name}
                email={user.email}
                position={user.position}
              />
              ))}
            </>
          )}
        </div>
        <Pagination.Root
          className="pt-4"
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
  );
}

export default Users;