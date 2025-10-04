import { IoIosSearch } from "react-icons/io";
import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import "./styles/GrantSearch.css";
import { Grant } from "../../middle-layer/types/Grant";
import { api } from "./api";

function GrantSearch({ onGrantSelect }: any) {
  const [userInput, setUserInput] = useState("");
  const [grants, setGrants] = useState<Grant[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownGrants, setDropdownGrants] = useState<Grant[]>([]);

  useEffect(() => {
    fetchGrants();
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchGrants = async () => {
    try {
      const response = await api(`/grant`, { method: "GET" });
      const data: Grant[] = await response.json();
      const formattedData: Grant[] = data.map((grant: any) => ({
        ...grant,
        organization_name: grant.organization || "Unknown Organization",
      }));
      setGrants(formattedData);
    } catch (error) {
      console.error("Error fetching grants:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    performSearch(e.target.value);
  };

  const performSearch = (query: string) => {
    if (!query) {
      setDropdownGrants([]);
      setShowDropdown(false);
      return;
    }
    const fuse = new Fuse<Grant>(grants, {
      keys: ["organization_name"],
      threshold: 0.3,
    });
    const results = fuse.search(query).map((res) => res.item);
    setDropdownGrants(results.slice(0, 5));
    setShowDropdown(results.length > 0);
  };

  const handleSelectGrant = (selectedGrant: Grant) => {
    setUserInput(selectedGrant.organization);
    setShowDropdown(false);
    onGrantSelect?.(selectedGrant);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      !target.closest(".search-container") &&
      !target.closest(".dropdown-container")
    ) {
      setShowDropdown(false);
    }
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
              // color: "#aaa" // optional styling
            }}
          />
          <input
  type="text"
  placeholder="Search"
  className="search-input"
  onChange={handleInputChange}
  value={userInput}
  onFocus={() => setShowDropdown(dropdownGrants.length > 0)}
  style={{ paddingLeft: "2rem", backgroundColor: "white" }} // make room for the icon
/>


          {showDropdown && (
            <div className="dropdown-container">
              {dropdownGrants.map((grant, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleSelectGrant(grant)}
                >
                  {grant.organization}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default GrantSearch;
