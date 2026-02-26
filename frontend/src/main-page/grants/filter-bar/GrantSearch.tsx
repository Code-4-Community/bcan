import { useState } from "react";
import Fuse from "fuse.js";
import { updateSearchQuery } from "../../../external/bcanSatchel/actions";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { Grant } from "../../../../../middle-layer/types/Grant";
import SearchBar from "../../../components/SearchBar";

function GrantSearch() {
  const [userInput, setUserInput] = useState(getAppStore().searchQuery || "");
  // @ts-ignore
  const [grants, _setGrants] = useState<Grant[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    performSearch(e.target.value);
  };

  const performSearch = (query: string) => {
    if (!query) {
      updateSearchQuery("");
      return;
    }
    const fuse = new Fuse<Grant>(grants, {
      keys: ["organization_name"],
      threshold: 0.3,
    });
    // const results =
    fuse.search(query).map((res) => res.item);
    updateSearchQuery(query);
  };

  return (
    <SearchBar handleInputChange={handleInputChange} userInput={userInput} text="grant"/>
  );
}

export default GrantSearch;
