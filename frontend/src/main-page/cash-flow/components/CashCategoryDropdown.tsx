import { useId } from "react";
import { CostType } from "../../../../../middle-layer/types/CostType";
import { RevenueType } from "../../../../../middle-layer/types/RevenueType";
import { Frequency } from "../../../../../middle-layer/types/Frequency";

type CashCategoryDropdown = {
  type: typeof RevenueType | typeof CostType | typeof Frequency;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value: RevenueType | CostType | Frequency | "";
  name?: string;
  error?: boolean;
};

export default function CashCategoryDropdown({
  type,
  onChange,
  value,
  name = "Category",
  error,
}: CashCategoryDropdown) {
  const generatedId = useId();

  return (
    <div className="w-full">
      <label
        htmlFor={generatedId}
        className="block text-left font-semibold text-sm lg:text-base"
      >
        {name}
      </label>
      <div className="mt-2 flex items-center rounded-md relative">
          <select
            id={generatedId}
            value={value}
            onChange={onChange}
            className={`appearance-none block w-full rounded-md py-2.5 pl-4 pr-10 text-sm lg:text-base border-2 placeholder:text-grey-500 h-[2.71rem] lg:h-[2.95rem] focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-primary-900 ${
              error
                ? "border-red bg-red-lightest"
                : "border-grey-500 bg-grey-100"
            }`}
          >
            <option value="">{"Select a "}{name.toLowerCase()}</option>
            {Object.values(type).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-5 w-5 text-grey-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
  );
}
