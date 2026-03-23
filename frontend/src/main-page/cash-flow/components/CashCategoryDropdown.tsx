import { CostType } from "../../../../../middle-layer/types/CostType";
import { RevenueType } from "../../../../../middle-layer/types/RevenueType";

type CashCategoryDropdown = {
  type: typeof RevenueType | typeof CostType;
  onChange: () => void;
};

export default function CashCategoryDropdown({
  type,
  onChange,
}: CashCategoryDropdown) {
  return (
    <div className="w-full">
      <label htmlFor={"Category"} className="block text-left font-semibold text-sm lg:text-base">
        {"Category"}
      </label>
      <div className="mt-2 flex items-center rounded-md ">
        <select
          id="Category"
          value={"Grants"}
          onChange={onChange}
          className="block w-full rounded-md py-2.5 pl-4 pr-3 text-sm lg:text-base border-2 placeholder:text-grey-500 ${
            border-grey-500 bg-grey-100  h-[3rem]"
        >
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
