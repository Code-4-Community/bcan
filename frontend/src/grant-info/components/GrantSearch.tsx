import { Button, Input } from "@chakra-ui/react"
import { SetStateAction, useEffect, useState } from "react";


function GrantSearch() {

    const [userInput, setUserInput] = useState("");
    const [grants, setGrants] = useState([]);
    const [filter, setFilter] = useState("");

    

    // log user input on change for debugging
    useEffect(() => {
        // console.log(userInput)

    }, [grants]);

    // handles when the filter changes
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilter(e.target.value);
    };

    // stores the grant name
    const handleInputChange = (e: { target: { value: SetStateAction<string>; }; }) => {
        setUserInput(e.target.value);
    };

    // searches for a grant
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        // search for that grant
        const response = await fetch(`http://localhost:3001/grant`, {
            method: 'GET'
        });

        const currGrants = await response.json();
        console.log("HELLO", currGrants)
        setGrants(currGrants)
    };

    return (
        <div className="grant-page">
            <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select onChange={handleFilterChange} value={filter}>
                    <option value="">Filter by</option>
                    <option value="title">Title</option>
                    <option value="status">Status</option>
                </select>

                <Input
                    placeholder="Search"
                    variant="subtle"
                    color="black"
                    onChange={handleInputChange}
                />

                <Button type="submit" colorScheme="blue">
                    🔍
                </Button>
            </form>
            
        </div>

    );
}

export default GrantSearch;