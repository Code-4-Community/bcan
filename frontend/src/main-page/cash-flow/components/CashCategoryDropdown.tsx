import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { CostType } from "../../../../../middle-layer/types/CostType";
import { RevenueType } from "../../../../../middle-layer/types/RevenueType";
import { Frequency } from "../../../../../middle-layer/types/Frequency";

type CashCategoryDropdown = {
  type: typeof RevenueType | typeof CostType | typeof Frequency;
  onValueChange: (value: RevenueType | CostType | Frequency) => void;
  value: RevenueType | CostType | Frequency | "";
  name?: string;
  error?: boolean;
};

export default function CashCategoryDropdown({
  type,
  onValueChange,
  value,
  name = "Category",
  error,
}: CashCategoryDropdown) {
  const generatedId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const options = useMemo(
    () => Object.values(type) as Array<RevenueType | CostType | Frequency>,
    [type],
  );
  const selectedLabel = value || `Select a ${name}`;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (selectedValue: RevenueType | CostType | Frequency) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      <label
        htmlFor={generatedId}
        className="block text-left font-semibold text-sm lg:text-base"
      >
        {name}
      </label>
      <div className="mt-1 relative flex items-center rounded-md">
        <button
          type="button"
          id={generatedId}
          onClick={() => setIsOpen((previous) => !previous)}
          className={`block w-full rounded-md py-2.5 pl-4 pr-10 text-left text-sm lg:text-base border-2 min-h-[2.5rem] lg:h-[3rem] overflow-hidden focus:outline-none focus:border-primary-900 ${
            error ? "border-red bg-red-lightest" : "border-grey-500 bg-grey-100"}
            ${!value ? "text-grey-700" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={name}
        >
          <span className="block truncate">{selectedLabel}</span>
        </button>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-grey-500"
        />
        {isOpen ? (
          <ul
            role="listbox"
            aria-labelledby={generatedId}
            className="absolute top-[calc(100%+0.35rem)] z-50 w-full rounded-xl border border-grey-300 bg-white p-1 shadow-lg"
          >
            {options.map((option) => (
              <li key={option}>
                <div
                  role="option"
                  aria-selected={value === option}
                  tabIndex={0}
                  onClick={() => handleSelect(option)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelect(option);
                    }
                  }}
                  className="w-full rounded-sm px-4 py-3 text-left text-sm lg:text-base text-grey-900 transition-colors hover:bg-green hover:text-white"
                >
                  {option}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
