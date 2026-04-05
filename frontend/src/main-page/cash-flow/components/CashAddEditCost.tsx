import { useState } from "react";
import { CashflowCost } from "../../../../../middle-layer/types/CashflowCost";
import { CostType } from "../../../../../middle-layer/types/CostType";
import Button from "../../../components/Button";
import InputField from "../../../components/InputField";
import CashCategoryDropdown from "./CashCategoryDropdown";
import { createNewCost, saveCostEdits } from "../processCashflowDataEditSave";
import { Frequency } from "../../../../../middle-layer/types/Frequency";
import { TDateISO } from "../../../../../backend/src/utils/date";

type FieldErrors = {
  type?: string;
  name?: string;
  frequency?: string;
  date?: string;
  amount?: string;
  submit?: string;
};

type CashEditCostProps = {
  costItem?: CashflowCost;
  onClose?: () => void;
};

export default function CashAddEditCost({
  costItem,
  onClose = () => {},
}: CashEditCostProps) {
  const [type, setType] = useState<CostType | null>(
    costItem ? costItem.type : null,
  );
  const [frequency, setFrequency] = useState<Frequency | null>(
    costItem ? costItem.frequency : null,
  );
  const [costName, setCostName] = useState<string>(
    costItem ? costItem.name : "",
  );
  const [amount, setAmount] = useState<number | null>(
    costItem ? costItem.amount : null,
  );
  const [date, setDate] = useState<TDateISO | null>(
    costItem ? costItem.date : null,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const buildPayload = (): CashflowCost | null => {
    const nextErrors: FieldErrors = {};

    if (!type) {
      nextErrors.type = "Please select a category.";
    }

    if (!frequency) {
      nextErrors.frequency = "Please select a frequency.";
    }

    if (!date) {
      nextErrors.date = "Please select a start date.";
    }

    if (!costName.trim()) {
      nextErrors.name = "Please enter a cost item name.";
    }

    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Annual amount must be greater than 0.";
    }

    setErrors(nextErrors);

    if (
      Object.keys(nextErrors).length > 0 ||
      !type ||
      !frequency ||
      !date ||
      amount === null
    ) {
      return null;
    }

    return {
      name: costName.trim(),
      type,
      amount,
      frequency,
      date,
    };
  };

  const resetForm = () => {
    setType(null);
    setFrequency(null);
    setCostName("");
    setAmount(null);
    setDate(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    setSuccessMessage(null);
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    setErrors((previous) => ({ ...previous, submit: undefined }));

    const result = costItem
      ? await saveCostEdits(payload, costItem!.name)
      : await createNewCost(payload);
    if (!result.success) {
      setErrors((previous) => ({
        ...previous,
        submit: result.error || "Unable to create cost item.",
      }));
      setSuccessMessage(null);
      setIsSubmitting(false);
      return;
    }

    if (costItem) {
      onClose();
    } else {
      setIsSubmitting(false);
      resetForm();
      showSuccessMessage("Cost item created successfully.");
    }
  };

  return (
    <div className="flex flex-col pt-2 px-2 col-span-2 h-full gap-2">
      {!costItem && (
        <div className="text-lg lg:text-xl w-full text-left font-bold">
          {"Add Cost Source"}
        </div>
      )}
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
          {errors.type ? (
            <p className="text-red text-sm">{errors.type}</p>
          ) : null}
        </div>
        <div className="flex flex-col col-span-1 gap-1">
          <InputField
            type="text"
            id="cost_name"
            label="Cost Source Name"
            placeholder="Enter item name..."
            value={costName}
            onChange={(event) => setCostName(event.target.value)}
            error={Boolean(errors.name)}
          />
          {errors.name ? (
            <p className="text-red text-sm">{errors.name}</p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 w-full justify-between gap-4 mt-2">
        <div className="flex flex-col col-span-1 w-full gap-1">
          <CashCategoryDropdown
            type={Frequency}
            onChange={(event) => {
              const nextFrequency = event.target.value;
              setFrequency(nextFrequency ? (nextFrequency as Frequency) : null);
            }}
            name="Frequency"
            value={frequency ?? ""}
            error={Boolean(errors.frequency)}
          />
          {errors.frequency ? (
            <p className="text-red text-sm">{errors.frequency}</p>
          ) : null}
        </div>
        <div className="flex flex-col col-span-1 gap-1">
          <InputField
            type="date"
            id="date"
            label="Start Date"
            value={date ?? ""}
            onChange={(event) =>
              setDate(
                event.target.value ? (event.target.value as TDateISO) : null,
              )
            }
            error={Boolean(errors.date)}
          />
          {errors.date ? (
            <p className="text-red text-sm">{errors.date}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <InputField
          type="number"
          id="amount"
          label="Amount ($)"
          value={amount ?? ""}
          placeholder="e.g. 1000"
          className="w-full"
          error={Boolean(errors.amount)}
          onChange={(event) =>
            setAmount(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
        />
        {errors.amount ? (
          <p className="text-red text-sm">{errors.amount}</p>
        ) : null}
      </div>
      {errors.submit ? (
        <p className="text-red text-sm">{errors.submit}</p>
      ) : null}
      {successMessage ? (
        <p className="text-green text-sm">{successMessage}</p>
      ) : null}
      {!costItem ? (
        <Button
          text="Add Cost Item"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary text-white mt-2 text-sm lg:text-base"
        />
      ) : (
        <div className="flex flex-row justify-end gap-2 mt-2 items-center">
          <Button
            text="Cancel"
            onClick={() => onClose()}
            className="bg-white text-black border border-grey-500 mt-2 text-sm lg:text-base"
          />
          <Button
            text="Save"
            onClick={() => handleSubmit()}
            className="bg-primary-900 text-white mt-2 text-sm lg:text-base"
          />
        </div>
      )}
    </div>
  );
}
