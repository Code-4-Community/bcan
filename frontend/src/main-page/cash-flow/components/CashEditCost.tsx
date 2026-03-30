import Button from "../../../components/Button";
import InputField from "../../../components/InputField";
import CashCategoryDropdown from "./CashCategoryDropdown";
import { CostType } from "../../../../../middle-layer/types/CostType";
import { useState } from "react";
import { CashflowCost } from "../../../../../middle-layer/types/CashflowCost";
import { saveCostEdits } from "../processCashflowDataEditSave";
import { formatMoney } from "../CashFlowPage";

type CashEditCostProps = {
  costItem: CashflowCost;
  onClose: () => void;
};

export default function CashEditCost({ costItem, onClose }: CashEditCostProps) {
  const [type, setType] = useState<CostType>(costItem.type);
  const [name, setName] = useState<string>(costItem.name);
  const [amount, setAmount] = useState<number>(costItem.amount);

  const handleChangeCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as CostType);
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.valueAsNumber);
  };

  const handleSave = () => {
    saveCostEdits({ name, type, amount, date: "2020-01-01" }, costItem.name);
    onClose();
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full justify-between gap-4 mb-2">
        <div className="flex flex-col col-span-1 w-full gap-3">
          <CashCategoryDropdown
            type={CostType}
            value={type}
            onChange={handleChangeCategory}
          />
        </div>
        <div className="flex flex-col col-span-1 gap-3">
          <InputField
            type="text"
            id="cost_name"
            label="Cost Item Name"
            value={name}
            onChange={handleChangeName}
          />
        </div>
      </div>
      <InputField
        type="number"
        id="amount"
        label="Annual Amount ($)"
        value={amount}
        className="w-full"
        onChange={handleChangeAmount}
      />

      <div className="flex flex-row justify-end gap-2 mt-2 items-center">
        <div className="font-semibold mr-auto text-start text-sm lg:text-base">
          {formatMoney(amount / 12)}
          {"/month"}
        </div>
        <Button
          text="Cancel"
          onClick={() => onClose()}
          className="bg-white text-black border border-grey-500 mt-2 text-sm lg:text-base"
        />
        <Button
          text="Save"
          onClick={() => handleSave()}
          className="bg-primary-900 text-white mt-2 text-sm lg:text-base"
        />
      </div>
    </div>
  );
}
