import { useEffect, useRef, useState } from "react";
import Button from "../../../../components/Button.tsx";
import { faAngleDown, faAngleUp, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
	const [openDateInput, setOpenDateInput] = useState<"start" | "end" | null>(null);
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	// helper methods for converting between string and Date objects, and for displaying dates in MM-DD-YYYY format
	const stringToDate = (value: string) => (value ? new Date(`${value}T00:00:00`) : null);

	const dateToString = (value: Date | null) => {
		if (!value) return "";
		const year = value.getFullYear();
		const month = `${value.getMonth() + 1}`.padStart(2, "0");
		const day = `${value.getDate()}`.padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const displayDate = (value: string) => {
		if (!value) return "";
		const [year, month, day] = value.split("-");
		return year && month && day ? `${month}-${day}-${year}` : "";
	};

	// Close the date picker when clicking outside of it
	useEffect(() => {
		if (!openDateInput) return;
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (!dropdownRef.current?.contains(event.target as Node)) {
				setOpenDateInput(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [openDateInput]);

	const handleClearAll = () => {
		setDirection(null);
		setStartValue("");
		setEndValue("");
		setOpenDateInput(null);
		onClearAll?.();
	};

	const toggleDatePicker = (field: "start" | "end") => {
		setOpenDateInput((current) => (current === field ? null : field));
	};

	const handleStartDateChange = (value: Date | null) => {
		const nextStartValue = dateToString(value);
		setStartValue(nextStartValue);
		onRangeChange?.(nextStartValue, endValue);
		setOpenDateInput(null);
	};

	const handleEndDateChange = (value: Date | null) => {
		const nextEndValue = dateToString(value);
		setEndValue(nextEndValue);
		onRangeChange?.(startValue, nextEndValue);
		setOpenDateInput(null);
	};

	// for clearing the date filters
	const clearStartDate = () => {
		setStartValue("");
		onRangeChange?.("", endValue);
	};

	const clearEndDate = () => {
		setEndValue("");
		onRangeChange?.(startValue, "");
	};

	/**
	 * LOCAL COMPONENT FOR DATE INPUTS
	 */
	interface DateInputProps {
		field: "start" | "end";
		placeholder: string;
		value: string;
		onChange: (value: Date | null) => void;
		onClear: () => void;
		minDate?: Date | undefined;
		maxDate?: Date | undefined;
	}

	const DateInput = ({field, placeholder, value, onChange, onClear, minDate, maxDate,}: DateInputProps) => {
		const [visibleMonth, setVisibleMonth] = useState<Date>(stringToDate(value) ?? new Date());

		useEffect(() => {
			if (openDateInput === field) {
				setVisibleMonth(stringToDate(value) ?? new Date());
			}
		}, [field, value]);

		return (
		<div className="relative">
			<input
				className="w-40 h-[2.25rem] rounded border border-grey-600 px-2 py-1 pr-8 text-sm bg-white cursor-pointer"
				type="text"
				readOnly
				placeholder={placeholder}
				value={displayDate(value)}
				onClick={() => toggleDatePicker(field)}
			/>
			<FontAwesomeIcon
				icon={faCalendarDays}
				className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-grey-600"
			/>
			{openDateInput === field && (
				<div className="absolute left-0 top-full mt-2 z-50">
					<div className="rounded border border-grey-300 bg-white p-2 shadow-md">
						<DatePicker
							selected={stringToDate(value)}
							onChange={onChange}
							minDate={minDate}
							maxDate={maxDate}
							onMonthChange={(date) => setVisibleMonth(date)}
							dayClassName={(date) =>
								date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()
									? "invisible pointer-events-none"
									: ""
							}
							inline
						/>
						<div className="flex justify-end px-2 pb-1">
							<button
								type="button"
								className="text-sm font-semibold text-secondary-400"
								onClick={onClear}
							>
								Clear
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
		);
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
			<div className="flex gap-2 flex-wrap">
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
			{rangeType === "date" ? (
				<div ref={dropdownRef} className="flex gap-2 flex-wrap items-start">
					<DateInput
						field="start"
						placeholder="Start date"
						value={startValue}
						onChange={handleStartDateChange}
						onClear={clearStartDate}
						maxDate={stringToDate(endValue) ?? undefined}
					/>
					<span className="text-sm font-semibold pt-2"> to </span>
					<DateInput
						field="end"
						placeholder="End date"
						value={endValue}
						onChange={handleEndDateChange}
						onClear={clearEndDate}
						minDate={stringToDate(startValue) ?? undefined}
					/>
				</div>
			) : (
				<div className="flex gap-2 flex-wrap">
					<input
						className="w-32 h-[2.25rem] rounded border border-grey-600 px-2 py-1 text-sm bg-white"
						type="number"
						value={startValue}
						placeholder="Min"
						onChange={(e) => {
							setStartValue(e.target.value);
							onRangeChange?.(e.target.value, endValue);
						}}
					/>
					<span className="text-sm font-semibold pt-2"> to </span>
					<input
						className="w-32 h-[2.25rem] rounded border border-grey-600 px-2 py-1 text-sm bg-white"
						type="number"
						value={endValue}
						placeholder="Max"
						onChange={(e) => {
							setEndValue(e.target.value);
							onRangeChange?.(startValue, e.target.value);
						}}
					/>
				</div>
			)}
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
