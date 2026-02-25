import { IoMdSearch } from "react-icons/io";
import { useState } from "react";
import Fuse from "fuse.js";
import { getAppStore } from "../../external/bcanSatchel/store";
import { updateUserQuery } from "../../external/bcanSatchel/actions";
import { User } from "../../../../middle-layer/types/User";

function UserSearch() {
  const [userInput, setUserInput] = useState(getAppStore().userQuery || "");
  // @ts-ignore
  const [users, _setUsers] = useState<User[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    performSearch(e.target.value);
  };

  const performSearch = (query: string) => {
    if (!query) {
      updateUserQuery("");
      return;
    }
    const fuse = new Fuse<User>(users, {
      keys: ["firstName", "lastName", "email"],
      threshold: 0.3,
    });
    // const results =
    fuse.search(query).map((res) => res.item);
    updateUserQuery(query);
  };

  return (
    <div className="w-full relative">
      {/* Absolutely-positioned icon */}
      <IoMdSearch
        style={{
          position: "absolute",
          top: "50%",
          left: "0.7rem",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 2,
          marginLeft: "2px",
        }}
      />
      <input
        placeholder="Search for a user..."
        className="w-full px-4 py-2 rounded-3xl font-medium text-black border-2 flex items-center justify-center border-grey-500"
        onChange={handleInputChange}
        value={userInput}
        style={{ paddingLeft: "2rem" }} // make room for the icon
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}

export default UserSearch;
