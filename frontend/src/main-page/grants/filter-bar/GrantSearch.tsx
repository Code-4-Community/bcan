import { IoMdSearch } from "react-icons/io";
import { useState } from "react";
import Fuse from "fuse.js";
import { updateSearchQuery } from "../../../external/bcanSatchel/actions";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { Input } from "@chakra-ui/react";

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
      <Input
        placeholder="Search for a grant..."
        variant="subtle"
        className="px-4 py-2 rounded-3xl font-medium text-black border-2 flex items-center justify-center border-grey-500"
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

export default GrantSearch;
