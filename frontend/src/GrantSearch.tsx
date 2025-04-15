import { Button, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import "./styles/GrantSearch.css";
import { Grant } from "../../middle-layer/types/Grant";

function GrantSearch({ onGrantSelect } : any) {
    const [userInput, setUserInput] = useState("");
    const [grants, setGrants] = useState<Grant[]>([]);
    /* const [filter, setFilter] = useState(""); */
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
            const response = await fetch(`http://localhost:3001/grant`, { method: 'GET' });
            const data: Grant[] = await response.json();
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
        const results = fuse.search(query).map(result => result.item);
        setDropdownGrants(results.slice(0, 5));
        setShowDropdown(results.length > 0);
    };

    const handleSelectGrant = (selectedGrant: Grant) => {
        setUserInput(selectedGrant.organization);
        setShowDropdown(false);
        if (onGrantSelect) {
            onGrantSelect(selectedGrant);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".search-container") && !target.closest(".dropdown-container")) {
            setShowDropdown(false);
        }
    };

    const handleGoClick = () => {
        if (!userInput) return;
        const fuse = new Fuse<Grant>(grants, {
            keys: ["organization_name"],
            threshold: 0.3,
        });
        const results = fuse.search(userInput).map(result => result.item);
        if (results.length > 0 && onGrantSelect) {
            onGrantSelect(results[0]);
        }
    };

    return (
        <div className="search-bar-main-container">
            <form className="search-container">
                <Button type="button" colorScheme="blue" onClick={handleGoClick}>
                    Go
                </Button>
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
            </form>
        </div>
    );
}

export default GrantSearch;
