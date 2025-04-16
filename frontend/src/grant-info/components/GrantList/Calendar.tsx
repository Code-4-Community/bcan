import {useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {updateStartDateFilter, updateEndDateFilter} from "../../../external/bcanSatchel/actions.ts";

function Calendar({ onClear }: { onClear?: () => void }) {
    // initializes start date to today
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // update state when there is a new start/end selected
    const onChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        // updates the store
        updateStartDateFilter(start);
        updateEndDateFilter(end);
        console.log("store updated start date to", start);
        console.log("store updated end date to", end);
    }

    const clearFilters = () => {
        onChange([null, null]);
        // will use the given callback to close itself
        onClear?.();
    };
    return (
        <div>
            <DatePicker
                selected={null}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
            />
            <button onClick={clearFilters} style={{marginTop: "0.5rem", marginLeft: "1rem"}}>
                Clear
            </button>
        </div>

    )
}

export default Calendar;