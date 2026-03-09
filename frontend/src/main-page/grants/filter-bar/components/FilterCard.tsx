import { useState } from "react";
import Button from "../../../../components/Button.tsx";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

type SortDirection = "increasing" | "decreasing";

interface FilterCardProps {
	directionFirst?: boolean;
	initialDirection?: SortDirection;
	initialStartDate?: string;
	initialEndDate?: string;
	onClearAll?: () => void;
	onDirectionChange?: (direction: SortDirection) => void;
	onDateRangeChange?: (startDate: string, endDate: string) => void;
}

export default function FilterCard({
	directionFirst = true, //if true, direction section is shown before date range section
	initialDirection = "increasing", //default sort direction is increasing
	initialStartDate = "", //default start date is empty string (no filter)
	initialEndDate = "", //default end date is empty string (no filter)
	onClearAll, //optional callback for when "Clear all" is clicked
	onDirectionChange, //optional callback for when sort direction changes
	onDateRangeChange, //optional callback for when date range changes
}: FilterCardProps) {
	const [direction, setDirection] = useState<SortDirection>(initialDirection);
	const [startDate, setStartDate] = useState(initialStartDate);
	const [endDate, setEndDate] = useState(initialEndDate);

	const handleClearAll = () => {
		setDirection("increasing");
		setStartDate("");
		setEndDate("");
		onClearAll?.();
	};

	const directionSection = (
		<div className="flex flex-col gap-2">
			<div className="text-sm font-semibold flex justify-between items-center">
				<span>Direction</span>
				<Button
					text="Clear all"
					onClick={handleClearAll}
					className="text-xs font-semibold text-secondary-400 border-0 hover:text-secondary-400 hover:bg-opacity-0 hover:border hover:border-white"
				/>
			</div>
			<div className="flex gap-2">
				<Button
					logo={faAngleUp}
					logoPosition="left"
					text="Increasing"
					onClick={() => {
						setDirection("increasing");
						onDirectionChange?.("increasing");
					}}
					className={
						direction === "increasing"
							? "bg-primary-900 text-white px-3 py-1 text-sm"
							: "bg-white px-3 py-1 text-sm border-1 border-grey-600"
					}
				/>
				<span className="text-sm font-semibold pt-2"> or </span>
				<Button
					logo={faAngleDown}
					logoPosition="left"
					text="Decreasing"
					onClick={() => {
						setDirection("decreasing");
						onDirectionChange?.("decreasing");
					}}
					className={
						direction === "decreasing"
							? "bg-primary-900 text-white px-3 py-1 text-sm"
							: "bg-white px-3 py-1 text-sm border-1 border-grey-600"
					}
				/>
			</div>
		</div>
	);

    // date format: "YYYY-MM-DD"
	const dateRangeSection = (
		<div className="flex flex-col gap-2">
			<div className="text-sm font-semibold flex justify-start">Date Range</div>
			<div className="flex gap-2">
				<input
					className="w-full rounded border border-grey-600 px-2 py-1 text-sm bg-white"
					type="date"
					value={startDate}
					onChange={(e) => {
						setStartDate(e.target.value);
						onDateRangeChange?.(e.target.value, endDate);
					}}
				/>
				<span className="text-sm font-semibold pt-2"> to </span>
				<input
					className="w-full rounded border border-grey-600 px-2 py-1 text-sm bg-white"
					type="date"
					value={endDate}
					onChange={(e) => {
						setEndDate(e.target.value);
						onDateRangeChange?.(startDate, e.target.value);
					}}
				/>
			</div>
		</div>
	);

	const sections = directionFirst
		? [directionSection, dateRangeSection]
		: [dateRangeSection, directionSection];

	return (
		<div className="flex flex-col gap-2 rounded-[1rem] border-[0.13rem] border-primary-900 p-4">
			{sections}
		</div>
	);
}
