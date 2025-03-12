import { Button, Input } from "@chakra-ui/react"
import { SetStateAction, useEffect, useState } from "react";
import Fuse from "fuse.js";
import { Grant } from "@/external/bcanSatchel/store";


function GrantSearch() {

    const [userInput, setUserInput] = useState("");
    const [grants, setGrants] = useState<Grant[]>([]);
    const [filteredGrants, setFilteredGrants] = useState<Grant[]>([]);
    const [filter, setFilter] = useState("");

    

    // log user input on change for debugging
    useEffect(() => {
        
        fetchGrants()
        // console.log("Filtered", filteredGrants)

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
            setFilteredGrants(formattedData);
            // console.log("Fetched Grants:", data);
            // setGrants(data);
            // setFilteredGrants(data);
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
            setFilteredGrants(grants);
            return;
        }

        const fuse = new Fuse<Grant>(grants, {
            keys: filter ? [filter] : ["organization_name"], 
            threshold: 0.3, 
        });

        const results = fuse.search(query).map(result => result.item);
        // console.log(results)
        setFilteredGrants(results);
    };

    // // searches for a grant
    // const handleSubmit = async (e: any) => {
    //     e.preventDefault();
    //     // search for that grant
    //     const response = await fetch(`http://localhost:3001/grant`, {
    //         method: 'GET'
    //     });

    //     const currGrants = await response.json();
    //     console.log("HELLO", currGrants)
    //     setGrants(currGrants)
    // };

    return (
        <div className="grant-page">
            <form style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select onChange={handleFilterChange} value={filter}>
                    <option value="">Filter by</option>
                    <option value="organization">Organization Name</option>
                </select>

                <Input
                    placeholder="Search"
                    variant="subtle"
                    color="black"
                    onChange={handleInputChange}
                    value={userInput}
                />

                <Button type="button" colorScheme="blue" onClick={() => performSearch(userInput)}>
                    Search
                </Button>
            </form>

            <div>
                {filteredGrants.length > 0 ? (
                    <ul>
                        {filteredGrants.map((grant, index) => (
                            <li key={index}>{grant.organization_name}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );
}

export default GrantSearch;