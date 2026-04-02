import { useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { CashflowRevenue } from "../../../../../middle-layer/types/CashflowRevenue";
import { Installment } from "../../../../../middle-layer/types/Installment";
import { RevenueType } from "../../../../../middle-layer/types/RevenueType";
import Button from "../../../components/Button";
import InputField from "../../../components/InputField";
import {
  saveRevenueEdits,
} from "../processCashflowDataEditSave";
import CashCategoryDropdown from "./CashCategoryDropdown";
import CashRevenueInstallment, {
  EditableInstallment,
} from "./CashRevenueInstallment";
import { formatMoney } from "../CashFlowPage";

type CashEditRevenueProps = {
  revenueItem: CashflowRevenue;
  onClose: () => void;
};

type FieldErrors = {
  type?: string;
  name?: string;
  singleAmount?: string;
  singleDate?: string;
  installments?: string;
  submit?: string;
};

const EMPTY_INSTALLMENT: EditableInstallment = {
  amount: null,
  date: null,
};

const toDateValue = (dateValue: Date | string | null | undefined) => {
  if (!dateValue) {
    return null;
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const toEditableInstallment = (
  installment: Installment,
): EditableInstallment => ({
  amount: Number.isFinite(installment.amount) ? installment.amount : null,
  date: toDateValue(installment.date),
});

export default function CashEditRevenue({
  revenueItem,
  onClose,
}: CashEditRevenueProps) {
  const initialInstallments = revenueItem.installments.map(toEditableInstallment);
  const [name, setName] = useState<string>(revenueItem.name);
  const [type, setType] = useState<RevenueType | null>(revenueItem.type);
  const [isMultipleInstallments, setIsMultipleInstallments] = useState(
    initialInstallments.length > 1,
  );
  const [singleInstallment, setSingleInstallment] = useState<EditableInstallment>(
    initialInstallments[0] ?? EMPTY_INSTALLMENT,
  );
  const [installments, setInstallments] = useState<EditableInstallment[]>(
    initialInstallments.length > 1 ? initialInstallments : [],
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidInstallment = (installment: EditableInstallment) => {
    if (installment.amount === null || installment.date === null) {
      return false;
    }

    return (
      Number.isFinite(installment.amount) &&
      installment.amount > 0 &&
      !Number.isNaN(installment.date.getTime())
    );
  };

  const toInstallment = (installment: EditableInstallment): Installment => ({
    amount: installment.amount as number,
    date: installment.date as Date,
  });

  const buildPayload = (): CashflowRevenue | null => {
    const nextErrors: FieldErrors = {};

    if (!type) {
      nextErrors.type = "Please select a category.";
    }

    if (!name.trim()) {
      nextErrors.name = "Please enter a name.";
    }

    let cleanedInstallments: Installment[] = [];
    if (isMultipleInstallments) {
      const allValid =
        installments.length > 0 && installments.every(isValidInstallment);

      if (!allValid) {
        nextErrors.installments =
          "Please fill all installment amounts and dates with valid values.";
      } else {
        cleanedInstallments = installments.map(toInstallment);
      }
    } else {
      if (singleInstallment.amount === null || singleInstallment.amount <= 0) {
        nextErrors.singleAmount = "Amount must be greater than 0.";
      }

      if (
        singleInstallment.date === null ||
        Number.isNaN(singleInstallment.date.getTime())
      ) {
        nextErrors.singleDate = "Please enter a valid date.";
      }

      if (!nextErrors.singleAmount && !nextErrors.singleDate) {
        cleanedInstallments = [toInstallment(singleInstallment)];
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !type) {
      return null;
    }

    const totalAmount = cleanedInstallments.reduce(
      (sum, installment) => sum + installment.amount,
      0,
    );

    return {
      amount: totalAmount,
      type,
      name: name.trim(),
      installments: cleanedInstallments,
    };
  };

  const addInstallment = () => {
    if (!isMultipleInstallments) {
      setInstallments([singleInstallment, EMPTY_INSTALLMENT]);
      setIsMultipleInstallments(true);
      return;
    }

    setInstallments((previousInstallments) => [
      ...previousInstallments,
      EMPTY_INSTALLMENT,
    ]);
  };

  const updateInstallment = (
    installmentIndex: number,
    key: "amount" | "date",
    value: number | Date | null,
  ) => {
    setInstallments((previousInstallments) =>
      previousInstallments.map((installment, index) =>
        index === installmentIndex
          ? { ...installment, [key]: value }
          : installment,
      ),
    );
  };

  const removeInstallment = (installmentIndex: number) => {
    setInstallments((previousInstallments) => {
      const updatedInstallments = previousInstallments.filter(
        (_, index) => index !== installmentIndex,
      );

      if (updatedInstallments.length <= 1) {
        setIsMultipleInstallments(false);
        setSingleInstallment(updatedInstallments[0] ?? EMPTY_INSTALLMENT);
        return [];
      }

      return updatedInstallments;
    });
  };

  const totalAmount = isMultipleInstallments
    ? installments.reduce(
        (sum, installment) => sum + (installment.amount ?? 0),
        0,
      )
    : (singleInstallment.amount ?? 0);

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    setErrors((previous) => ({ ...previous, submit: undefined }));

    const result = await saveRevenueEdits(revenueItem.name, payload);
    if (!result.success) {
      setErrors((previous) => ({
        ...previous,
        submit: result.error || "Unable to update revenue source.",
      }));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 w-full gap-4">
        <div className="flex flex-col gap-1">
          <InputField
            type="text"
            id="revenue_source_name"
            label="Revenue Source Name"
            value={name}
            error={Boolean(errors.name)}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name ? <p className="text-red text-sm">{errors.name}</p> : null}
        </div>
        <div className="flex flex-col gap-1">
          <CashCategoryDropdown
            type={RevenueType}
            onChange={(event) => {
              const nextType = event.target.value;
              setType(nextType ? (nextType as RevenueType) : null);
            }}
            value={type ?? ""}
            error={Boolean(errors.type)}
          />
          {errors.type ? <p className="text-red text-sm">{errors.type}</p> : null}
        </div>
      </div>

      {isMultipleInstallments ? (
        <>
          {installments.map((installment, index) => (
            <CashRevenueInstallment
              key={index}
              id={`edit_${index}`}
              installment={installment}
              onAmountChange={(value) => updateInstallment(index, "amount", value)}
              onDateChange={(value) => updateInstallment(index, "date", value)}
              onDelete={() => removeInstallment(index)}
            />
          ))}
          {errors.installments ? (
            <p className="text-red text-sm">{errors.installments}</p>
          ) : null}
        </>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 w-full gap-4">
          <div className="flex flex-col gap-1">
            <InputField
              type="number"
              id="edit_amount"
              label="Amount ($)"
              value={singleInstallment.amount ?? ""}
              placeholder="e.g. 1000"
              error={Boolean(errors.singleAmount)}
              onChange={(event) =>
                setSingleInstallment((previous) => ({
                  ...previous,
                  amount: event.target.value === "" ? null : Number(event.target.value),
                }))
              }
            />
            {errors.singleAmount ? (
              <p className="text-red text-sm">{errors.singleAmount}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <InputField
              type="date"
              id="edit_date"
              label="Date"
              value={
                singleInstallment.date
                  ? `${singleInstallment.date.getFullYear()}-${`${singleInstallment.date.getMonth() + 1}`.padStart(2, "0")}-${`${singleInstallment.date.getDate()}`.padStart(2, "0")}`
                  : ""
              }
              placeholder="MM/DD/YYYY"
              error={Boolean(errors.singleDate)}
              onChange={(event) =>
                setSingleInstallment((previous) => ({
                  ...previous,
                  date: event.target.value
                    ? new Date(`${event.target.value}T00:00:00`)
                    : null,
                }))
              }
            />
            {errors.singleDate ? (
              <p className="text-red text-sm">{errors.singleDate}</p>
            ) : null}
          </div>
        </div>
      )}

      {errors.submit ? <p className="text-red text-sm">{errors.submit}</p> : null}

      <div className="flex flex-wrap items-center gap-2 mt-2">
        <Button
          text="Add Installment"
          onClick={addInstallment}
          logo={faPlus}
          logoPosition="left"
          className="bg-primary-900 text-white text-sm"
        />
        <div className="font-semibold ml-auto text-sm lg:text-base">
          {"Total: "}
          {formatMoney(totalAmount)}
        </div>
        <Button
          text="Cancel"
          onClick={onClose}
          className="bg-white text-black border border-grey-500 text-sm lg:text-base"
        />
        <Button
          text={isSubmitting ? "Saving..." : "Save"}
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-primary-900 text-white text-sm lg:text-base"
        />
      </div>
    </div>
  );
}
