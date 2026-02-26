import { useState } from "react";
import Fuse from "fuse.js";
import { getAppStore } from "../../external/bcanSatchel/store";
import { updateUserQuery } from "../../external/bcanSatchel/actions";
import { User } from "../../../../middle-layer/types/User";
import SearchBar from "../../components/SearchBar";

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
    <SearchBar handleInputChange={handleInputChange} userInput={userInput} text="user"/>
  );
}

export default UserSearch;
