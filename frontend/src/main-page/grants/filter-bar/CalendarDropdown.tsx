import { useState } from "react";
import { observer } from "mobx-react-lite";
import { getAppStore } from "../../../external/bcanSatchel/store";
import Calendar from "./Calendar";
import "../styles/CalendarDropdown.css";
import { FaCalendarAlt, FaChevronRight } from "react-icons/fa";

// observer to make satchel store state variables
const CalendarDropdown = observer(() => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);

    const { startDateFilter, endDateFilter } = getAppStore();

    // ex: Apr 14th, 2025
    const formatDate = (date: Date) =>
        date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // state variable not needed since will always rerender with satchel changes
    let displayText = "Select Date Range";
    if (startDateFilter && endDateFilter) {
        displayText = `${formatDate(startDateFilter)} - ${formatDate(endDateFilter)}`;
    } else if (startDateFilter) {
        displayText = `${formatDate(startDateFilter)} - `;
    }

    return (
        <div className="calendar-dropdown">
            <button className="calendar-toggle-button" onClick={toggleDropdown}>
                <FaCalendarAlt className="calendar-icon" />
                <span>{displayText}</span>
                <FaChevronRight />
            </button>

            {isOpen && (
                <div className="calendar-popup">
                    <Calendar onClear={() => setIsOpen(false)} />
                </div>
            )}
        </div>
    );
});

export default CalendarDropdown;
