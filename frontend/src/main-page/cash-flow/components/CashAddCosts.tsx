import { CostType } from "../../../../../middle-layer/types/CostType";
import Button from "../../../components/Button";
import InputField from "../../../components/InputField";
import CashCategoryDropdown from "./CashCategoryDropdown";

export default function CashAddCosts() {
  return (
    <div className="flex flex-col pt-2 px-2 col-span-2 h-full gap-2">
      <div className="text-lg lg:text-xl w-full text-left font-bold">
        {"Add Cost Source"}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full justify-between gap-4">
        <div className="flex flex-col col-span-1 w-full gap-3">
          <CashCategoryDropdown type={CostType} onChange={() => {}} />
        </div>
        <div className="flex flex-col col-span-1 gap-3">
          <InputField
            type="text"
            id="cost_name"
            label="Cost Item Name"
            value={"Program Directory"}
          />
        </div>
      </div>
      <InputField
        type="number"
        id="amount"
        label="Annual Amount ($)"
        value={"325000"}
        className="w-full"
      />
      <Button
        text="Add Cost Item"
        onClick={() => alert("add cost source")}
        className="bg-primary text-white mt-2 text-sm lg:text-base"
      />
    </div>
  );
}
