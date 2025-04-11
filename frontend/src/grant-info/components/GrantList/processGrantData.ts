import { useEffect, useState } from "react";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { fetchAllGrants } from "../../../external/bcanSatchel/actions";
import { Grant } from "../../../../../middle-layer/types/Grant";
import {dateRangeFilter, filterGrants, statusFilter} from "./grantFilters";
import { sortGrants } from "./grantSorter.ts";

// GET request for all grants
const fetchGrants = async () => {
    try {
        const response = await fetch("http://localhost:3001/grant");
        if (!response.ok) {
            throw new Error(`HTTP Error, Status: ${response.status}`);
        }
        const updatedGrants: Grant[] = await response.json();
        fetchAllGrants(updatedGrants);
    } catch (error) {
        console.error("Error fetching grants:", error);
    }
};

// contains callbacks for sorting and filtering grants
// stores state for list of grants/filter
export const ProcessGrantData = () => {
    const { allGrants, filterStatus, startDateFilter, endDateFilter } = getAppStore();
    const [grants, setGrants] = useState<Grant[]>([]);

    // init grant list
    useEffect(() => {
        fetchGrants();
    }, []);

    // when filter changes, update grant list state
    useEffect(() => {
        const filters = [statusFilter(filterStatus), dateRangeFilter(startDateFilter, endDateFilter)]
        const filtered = filterGrants(allGrants, filters);
        setGrants(filtered);
        // current brute force update everything when an attribute changes
    }, [allGrants, filterStatus, startDateFilter, endDateFilter]);

    // sorts grants based on attribute given, updates grant list state
    const onSort = (header: keyof Grant, asc: boolean) => {
        const sorted = sortGrants(grants, header, asc);
        setGrants(sorted);
    };

    // calculates total # of pages for pagination
    return { grants, onSort };
};
