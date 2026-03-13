import { useState } from "react";
import Button from "../../../../components/Button.tsx";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

type SortDirection = "increasing" | "decreasing" | null;

interface FilterCardProps {
	directionFirst?: boolean;
	rangeType: "date" | "number";
	rangeLabel: string;
	initialDirection?: SortDirection;
	initialStartValue?: string;
	initialEndValue?: string;
	onClearAll?: () => void;
	onDirectionChange: (direction: SortDirection) => void;
	onRangeChange: (startValue: string, endValue: string) => void;
}

export default function FilterCard({
	directionFirst = true, //if true, direction section is shown before date range section
	rangeType, //type of range input, either "date" or "number"
	rangeLabel, //label for the range section
	initialDirection = null, //default sort direction is increasing
	initialStartValue = "", //default start value is empty string (no filter)
	initialEndValue = "", //default end value is empty string (no filter)
	onClearAll, //optional callback for when "Clear all" is clicked
	onDirectionChange, //optional callback for when sort direction changes
	onRangeChange, //optional callback for when range changes
}: FilterCardProps) {
	const [direction, setDirection] = useState<SortDirection>(initialDirection);
	const [startValue, setStartValue] = useState(initialStartValue);
	const [endValue, setEndValue] = useState(initialEndValue);

	const handleClearAll = () => {
		setDirection(null);
		setStartValue("");
		setEndValue("");
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
						onDirectionChange("increasing");
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
						onDirectionChange("decreasing");
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

	const rangeSection = (
		<div className="flex flex-col gap-2">
			<div className="text-sm font-semibold flex justify-start">{rangeLabel}</div>
			<div className="flex gap-2">
				<input
					className="w-full rounded border border-grey-600 px-2 py-1 text-sm bg-white"
					type={rangeType}
					value={startValue}
					placeholder={rangeType === "number" ? "Min" : undefined}
					onChange={(e) => {
						setStartValue(e.target.value);
						onRangeChange?.(e.target.value, endValue);
					}}
				/>
				<span className="text-sm font-semibold pt-2"> to </span>
				<input
					className="w-full rounded border border-grey-600 px-2 py-1 text-sm bg-white"
					type={rangeType}
					value={endValue}
					placeholder={rangeType === "number" ? "Max" : undefined}
					onChange={(e) => {
						setEndValue(e.target.value);
						onRangeChange?.(startValue, e.target.value);
					}}
				/>
			</div>
		</div>
	);

	const sections = directionFirst
		? [directionSection, rangeSection]
		: [rangeSection, directionSection];

	return (
		<div className="flex flex-col gap-2 rounded-[1rem] border-[0.13rem] border-primary-900 p-4 bg-white">
			{sections}
		</div>
	);
}
