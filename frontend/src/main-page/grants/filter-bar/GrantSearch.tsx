import { IoIosSearch } from "react-icons/io";
import { useState } from "react";
import Fuse from "fuse.js";
import { updateSearchQuery } from "../../../external/bcanSatchel/actions";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { Input } from "@chakra-ui/react";
import "../styles/GrantSearch.css";

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
    <div className="search-bar-main-container">
      <form className="search-container">
        <div
          className="search-input-container"
          style={{ position: "relative" }}
        >
          {/* Absolutely-positioned icon */}
          <IoIosSearch
            style={{
              position: "absolute",
              top: "50%",
              left: "8px",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              zIndex: 2,
              marginLeft: "2px",
            }}
          />
          <Input
            placeholder="Search"
            variant="subtle"
            className="search-input"
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
      </form>
    </div>
  );
}

export default GrantSearch;
