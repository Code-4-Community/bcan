import { useEffect, useState } from "react";
import ApprovedUserCard from "./ApprovedUserCard";
import PendingUserCard from "./PendingUserCard";
import { User } from "../../../../middle-layer/types/User";
import {api} from "../../api"
const fetchActiveUsers = async () => {
  try{
    const response = await api("/user/active");
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const activeUsers = await response.json();
    return activeUsers as User[];
  }
  catch (error) {
    console.error("Error fetching active users:", error);
  }
}

const fetchInactiveUsers = async () => {
  try{
    const response = await api("/user/inactive");
    if (!response.ok) {
      throw new Error(`HTTP Error, Status: ${response.status}`);
    }
    const activeUsers = await response.json();
    return activeUsers as User[];
  }
  catch (error) {
    console.error("Error fetching active users:", error);
  }
}


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
        <div>
          {usersTabStatus === UsersTab.CurrentUsers ? (
            <>
              <div className="flex px-9 pb-3 m-7 border-b border-b-[#BFBBBB] font-semibold justify-around">
                <p className="w-[140px] text-left">User Name</p>
                <p className="w-[140px] text-left">User ID</p>
                <p className="w-[140px] text-left">Email</p>
                <p className="w-[140px] text-left">Position</p>
              </div>
              <ApprovedUserCard
                name="Aaron Ashby"
                email="a.ashby@mit.edu"
                position="Employee"
              />
            </>
          ) : (
            <>
              <div className="flex px-9 pb-3 m-7 border-b border-b-[#BFBBBB] font-semibold justify-around">
                <p className="w-[140px] text-left">User Name</p>
                <p className="w-[140px] text-left">User ID</p>
                <p className="w-[140px] text-left">Email</p>
                <p className="w-[140px] text-left">Position</p>
                <p className="w-[140px] text-left">Date Requested</p>
                <div className="w-[140px]"></div>
              </div>
              <PendingUserCard
                name="Aaron Ashby"
                email="a.ashby@uconn.edu"
                position="Inactive"
                dateRequested={new Date("02/14/2006")}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;
