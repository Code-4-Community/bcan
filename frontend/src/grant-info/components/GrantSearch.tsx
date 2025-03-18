import { Button, Input } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import { Grant } from "@/external/bcanSatchel/store";


function GrantSearch() {

    const [userInput, setUserInput] = useState("");
    const [grants, setGrants] = useState<Grant[]>([]);
    const [filter, setFilter] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownGrants, setDropdownGrants] = useState<Grant[]>([]);


    // intially fetches grants from backend and creates an event listener to handle for clicks outside of the dropdown
    useEffect(() => {
        fetchGrants()
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };

    }, []);

    // fetches grants from backend
    const fetchGrants = async () => {
        try {
            const response = await fetch(`http://localhost:3001/grant`, { method: 'GET' });
            const data: Grant[] = await response.json();

            // change 'organization' to 'organization_name'; TODO: fix the grant type in backend
            const formattedData: Grant[] = data.map((grant: any) => ({
                ...grant,
                organization_name: grant.organization || "Unknown Organization", 
            }));

            console.log("Formatted Grants:", formattedData);
            setGrants(formattedData);
        } catch (error) {
            console.error("Error fetching grants:", error);
        }
    };

    // handles when the filter changes
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter(e.target.value);
    };

    // stores the grant name
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
        performSearch(e.target.value)
    };

    // searches using fuzzy search
    const performSearch = (query: string) => {
        if (!query) {
            setDropdownGrants([]);  
            setShowDropdown(false);
            return;
        }

        const fuse = new Fuse<Grant>(grants, {
            keys: filter ? [filter] : ["organization_name"], 
            threshold: 0.3, 
        });

        const results = fuse.search(query).map(result => result.item);
        setDropdownGrants(results.slice(0, 5)); 
        setShowDropdown(results.length > 0); 
    };

    // handle selection from dropdown
    const handleSelectGrant = (selectedGrant: Grant) => {
        setUserInput(selectedGrant.organization_name);
        setShowDropdown(false);
    };

    // hide dropdown when clicking outside of it
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".search-container") && !target.closest(".dropdown-container")) {
            setShowDropdown(false);
        }
    };


    return (
        <div className="grant-page">
            <form className="search-container" style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                <select onChange={handleFilterChange} value={filter}>
                    <option value="">Filter by</option>
                    <option value="organization">Organization Name</option>
                </select>

                <div style={{ position: "relative", width: "100%" }}>
                    <Input
                        placeholder="Search"
                        variant="subtle"
                        color="black"
                        onChange={handleInputChange}
                        value={userInput}
                        onFocus={() => {
                            if (dropdownGrants.length > 0) setShowDropdown(true)
                        }}
                    />

                    {showDropdown && (
                        <div
                            className="dropdown-container"
                            style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                width: "100%",
                                background: "black",
                                border: "1px solid #ddd",
                                borderRadius: "5px",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                zIndex: 10,
                                maxHeight: "200px",
                                overflowY: "auto",
                            }}>
                            {dropdownGrants.map((grant, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectGrant(grant)}
                                    style={{
                                        padding: "8px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#f1f1f1";
                                        e.currentTarget.style.color = "black"
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "black";
                                        e.currentTarget.style.color = "white"
                                    }}
                                >
                                    {grant.organization_name}
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                <Button type="button" colorScheme="blue" onClick={() => performSearch(userInput)}>
                    Search
                </Button>
            </form>
        </div>
    );
}

export default GrantSearch;