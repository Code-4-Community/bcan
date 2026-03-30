import { useId } from "react";
import { CostType } from "../../../../../middle-layer/types/CostType";
import { RevenueType } from "../../../../../middle-layer/types/RevenueType";

type CashCategoryDropdown = {
  type: typeof RevenueType | typeof CostType;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value: RevenueType | CostType | "";
  placeholder?: string;
  error?: boolean;
};

export default function CashCategoryDropdown({
  type,
  onChange,
  value,
  placeholder = "Select a category",
  error,
}: CashCategoryDropdown) {
  const generatedId = useId();

  return (
    <div className="w-full">
      <label
        htmlFor={generatedId}
        className="block text-left font-semibold text-sm lg:text-base"
      >
        {"Category"}
      </label>
      <div className="mt-2 flex items-center rounded-md ">
        <select
          id={generatedId}
          value={value}
          onChange={onChange}
          className={`block w-full rounded-md py-2.5 pl-4 pr-3 text-sm lg:text-base border-2 placeholder:text-grey-500 h-[2.71rem] lg:h-[2.95rem] ${
            error ? "border-red bg-red-lightest" : "border-grey-500 bg-grey-100"
          }`}
        >
          <option value="">{placeholder}</option>
          {Object.values(type).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
