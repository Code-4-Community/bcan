import { Button, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import "./styles/GrantSearch.css";
import { Grant } from "../../middle-layer/types/Grant";


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
        setUserInput(selectedGrant.organization);
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
        <div className="search-bar-main-container">
            <form className="search-container">
                <select className="filter-state" onChange={handleFilterChange} value={filter}>
                    <option value="">Filter by</option>
                    <option value="organization">Organization Name</option>
                </select>

                <div className="search-input-container">
                    <Input
                        placeholder="Search"
                        variant="subtle"
                        className="search-input"
                        onChange={handleInputChange}
                        value={userInput}
                        onFocus={() => setShowDropdown(dropdownGrants.length > 0)}
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

                <Button type="button" colorScheme="blue" onClick={() => performSearch(userInput)}>
                    Search
                </Button>
            </form>
        </div>
    );
}

export default GrantSearch;