import { useState } from "react";
import { CashflowRevenue } from "../../../../../middle-layer/types/CashflowRevenue";
import { Installment } from "../../../../../middle-layer/types/Installment";
import { RevenueType } from "../../../../../middle-layer/types/RevenueType";
import Button from "../../../components/Button";
import InputField from "../../../components/InputField";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CashCategoryDropdown from "./CashCategoryDropdown";
import CashRevenueInstallment, {
  EditableInstallment,
} from "./CashRevenueInstallment";
import { createNewRevenue } from "../../cash-flow/processCashflowDataEditSave";

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

const toDateInputValue = (date: Date | null) => {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

export default function CashAddRevenue() {
  const [isMultipleInstallments, setIsMultipleInstallments] = useState(false);
  const [singleInstallment, setSingleInstallment] =
    useState<EditableInstallment>(EMPTY_INSTALLMENT);
  const [installments, setInstallments] = useState<EditableInstallment[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<RevenueType | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const toInstallment = (installment: EditableInstallment): Installment => {
    return {
      amount: installment.amount as number,
      date: installment.date as Date,
    };
  };

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

  const resetForm = () => {
    setType(null);
    setName("");
    setSingleInstallment(EMPTY_INSTALLMENT);
    setInstallments([]);
    setIsMultipleInstallments(false);
    setErrors({});
  }

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrors((previous) => ({ ...previous, submit: undefined }));

    const result = await createNewRevenue(payload);
    if (!result.success) {
      setErrors((previous) => ({
        ...previous,
        submit: result.error || "Unable to create revenue source.",
      }));
      setSuccessMessage(null);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    resetForm();
    setSuccessMessage("Revenue source created successfully.");
  };

  const addInstallment = () => {
    if (!isMultipleInstallments) {
      setInstallments([singleInstallment, EMPTY_INSTALLMENT]);
      setIsMultipleInstallments(true);
      return;
    }

    setInstallments((previousInstallments) => [...previousInstallments, EMPTY_INSTALLMENT]);
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
        if (updatedInstallments[0]) {
          setSingleInstallment(updatedInstallments[0]);
        } else {
          setSingleInstallment(EMPTY_INSTALLMENT);
        }
        return [];
      }

      return updatedInstallments;
    });
  };

  return (
    <div className="flex flex-col pt-2 px-2 col-span-2 h-full gap-2">
      <div className="text-lg lg:text-xl w-full text-left font-bold">
        {"Add Revenue Source"}
      </div>
      <div className="flex flex-col w-full gap-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 w-full gap-4">
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
          <div className="flex flex-col gap-1">
            <InputField
              type="text"
              id="source_name"
              label="Revenue Source Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={Boolean(errors.name)}
            />
            {errors.name ? <p className="text-red text-sm">{errors.name}</p> : null}
          </div>
        </div>
        {isMultipleInstallments ? (
          <>
            {installments.map((installment, index) => (
              <CashRevenueInstallment
                key={index}
                id={index}
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
                id="amount"
                label="Amount ($)"
                value={singleInstallment.amount ?? ""}
                placeholder="e.g. 1000"
                error={Boolean(errors.singleAmount)}
                onChange={(event) =>
                  setSingleInstallment((previous) => ({
                    ...previous,
                    amount:
                      event.target.value === "" ? null : Number(event.target.value),
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
                id="date"
                label="Date"
                value={toDateInputValue(singleInstallment.date)}
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
        {successMessage ? (
          <p className="text-green text-sm">{successMessage}</p>
        ) : null}
      </div>
      <Button
        text="Add Installment"
        onClick={addInstallment}
        logo={faPlus}
        logoPosition="left"
        className="bg-primary-900 text-white w-fit ml-auto text-sm"
      />
      <Button
        text="Add Revenue Source"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-green text-white mt-2 text-sm lg:text-base"
      />
    </div>
  );
}
