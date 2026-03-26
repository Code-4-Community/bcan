import { useState } from "react";
import { CashflowCost } from "../../../../../middle-layer/types/CashflowCost";
import { CostType } from "../../../../../middle-layer/types/CostType";
import Button from "../../../components/Button";
import InputField from "../../../components/InputField";
import CashCategoryDropdown from "./CashCategoryDropdown";
import { createNewCost } from "../processCashflowDataEditSave";

type FieldErrors = {
  type?: string;
  name?: string;
  amount?: string;
  submit?: string;
};

export default function CashAddCosts() {
  const [type, setType] = useState<CostType | null>(null);
  const [costName, setCostName] = useState<string>("");
  const [amount, setAmount] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTodayIsoDate = () => {
    return new Date().toISOString();
  };

  const buildPayload = (): CashflowCost | null => {
    const nextErrors: FieldErrors = {};

    if (!type) {
      nextErrors.type = "Please select a category.";
    }

    if (!costName.trim()) {
      nextErrors.name = "Please enter a cost item name.";
    }

    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Annual amount must be greater than 0.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !type || amount === null) {
      return null;
    }

    return {
      name: costName.trim(),
      type,
      amount,
      date: getTodayIsoDate(),
    };
  };

  const resetForm = () => {
    setType(null);
    setCostName("");
    setAmount(null);
    setErrors({});
  }

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    setErrors((previous) => ({ ...previous, submit: undefined }));

    const result = await createNewCost(payload);
    if (!result.success) {
      setErrors((previous) => ({
        ...previous,
        submit: result.error || "Unable to create cost item.",
      }));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    resetForm();
  };

  return (
    <div className="flex flex-col pt-2 px-2 col-span-2 h-full gap-2">
      <div className="text-lg lg:text-xl w-full text-left font-bold">
        {"Add Cost Source"}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 w-full justify-between gap-4">
        <div className="flex flex-col col-span-1 w-full gap-1">
          <CashCategoryDropdown
            type={CostType}
            onChange={(event) => {
              const nextType = event.target.value;
              setType(nextType ? (nextType as CostType) : null);
            }}
            value={type ?? ""}
            error={Boolean(errors.type)}
          />
          {errors.type ? <p className="text-red text-sm">{errors.type}</p> : null}
        </div>
        <div className="flex flex-col col-span-1 gap-1">
          <InputField
            type="text"
            id="cost_name"
            label="Cost Item Name"
            value={costName}
            onChange={(event) => setCostName(event.target.value)}
            error={Boolean(errors.name)}
          />
          {errors.name ? <p className="text-red text-sm">{errors.name}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <InputField
          type="number"
          id="amount"
          label="Annual Amount ($)"
          value={amount ?? ""}
          className="w-full"
          error={Boolean(errors.amount)}
          onChange={(event) =>
            setAmount(event.target.value === "" ? null : Number(event.target.value))
          }
        />
        {errors.amount ? <p className="text-red text-sm">{errors.amount}</p> : null}
      </div>
      {errors.submit ? <p className="text-red text-sm">{errors.submit}</p> : null}
      <Button
        text="Add Cost Item"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-primary text-white mt-2 text-sm lg:text-base"
      />
    </div>
  );
}
