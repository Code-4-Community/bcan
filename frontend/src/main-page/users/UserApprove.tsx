import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { api } from "../../api";
import { getAppStore } from "../../external/bcanSatchel/store";
import { User } from "../../../../middle-layer/types/User";
import { toJS } from "mobx";
import { moveUserToActive, removeUser } from "./UserActions";
import { useState } from "react";

// Did not change this to using the email/first name last name due to user page redesign so someone will be changing all of this anyway

const store = getAppStore();

interface UserApproveProps {
  user: User;
}

const UserApprove = ({ user }: UserApproveProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const approveUser = async () => {
    setIsLoading(true);
    try {
      const response = await api("/user/change-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            email: user.email,
            position: user.position,
          } as User,
          groupName: "Employee",
          requestedBy: toJS(store.user) as User,
        }),
      });
      if (response.ok) {
        alert(`User ${user.email} has been approved successfully`);
        const body = await response.json();
        moveUserToActive(body as User);
      } else {
        alert("Failed to approve user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Error approving user");
    } finally {
      setIsLoading(false);
    }
  };

  const rejectUser = async () => {
    setIsLoading(true);
    try {
      const response = await api("user/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: {
            email: user.email,
            position: user.position,
          } as User,
          requestedBy: toJS(store.user) as User,
        }),
      });
      if (response.ok) {
        alert(`User ${user.email} has been deleted successfully`);
        const body = await response.json();
        removeUser(body);
      } else {
        alert("Failed to reject user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Error rejecting user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-3 w-full">
      <button
        className="bg-green-light flex-none w-8 h-8 focus:outline-none rounded-sm hover:border-green-dark"
        onClick={approveUser}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faCheck} className="text-green" />
      </button>
      <button
        className="bg-red-light flex-none w-8 h-8 focus:outline-none rounded-sm hover:border-red-dark"
        onClick={rejectUser}
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faX} className="text-red" />
      </button>
    </div>
  );
};

export default UserApprove;
