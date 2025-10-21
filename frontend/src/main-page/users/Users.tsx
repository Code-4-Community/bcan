import { useState } from "react";

// Represents a specific tab to show on the user page
enum UsersTab {
  PendingUsers,
  CurrentUsers,
}

function Users() {
  const [usersTabStatus, setUsersTabStatus] = useState<UsersTab>(
    UsersTab.CurrentUsers
  );

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
        {/* TODO: For the time being, I had to push the tabs over to the left a bit because border corners are diagonally cut */}
        <div className="absolute right-7 top-0 -translate-y-full flex">
          <button
            className={`w-52 h-16 border rounded-b-none focus:outline-none ${
              usersTabStatus === UsersTab.PendingUsers
                ? "bg-[#F5F4F4] border-x-[#000000] border-t-[#000000]"
                : "bg-[#F4F4F4] border-x-[#BFBBBB] border-t-[#BFBBBB] border-b-[#000000]"
            }`}
            onClick={() => setUsersTabStatus(UsersTab.PendingUsers)}
          >
            Pending Users
          </button>
          <button
            className={`w-52 h-16 border rounded-b-none ml-2 focus:outline-none ${
              usersTabStatus === UsersTab.CurrentUsers
                ? "bg-[#F5F4F4] border-x-[#000000] border-t-[#000000]"
                : "bg-[#F4F4F4] border-x-[#BFBBBB] border-t-[#BFBBBB] border-b-[#000000]"
            }`}
            onClick={() => setUsersTabStatus(UsersTab.CurrentUsers)}
          >
            Current Users
          </button>
        </div>
      </div>
    </div>
  );
}

export default Users;
