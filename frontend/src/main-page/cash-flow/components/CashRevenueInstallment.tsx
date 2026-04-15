import InputField from "../../../components/InputField";
import { FaXmark } from "react-icons/fa6";

export type EditableInstallment = {
  amount: number | null;
  date: Date | null;
};

type CashRevenueInstallmentProps = {
  id: string | number;
  installment: EditableInstallment;
  onAmountChange: (value: number | null) => void;
  onDateChange: (value: Date | null) => void;
  onDelete?: () => void;
  showDelete?: boolean;
};

const toDateInputValue = (date: Date | null) => {
  if (!date) {
    return "";
  }

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDateFromInput = (value: string) => {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00`);
};

export default function CashRevenueInstallment({
  id,
  installment,
  onAmountChange,
  onDateChange,
  onDelete,
  showDelete = true,
}: CashRevenueInstallmentProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 w-full gap-4 items-end">
      <InputField
        type="number"
        id={`amount_${id}`}
        label="Amount ($)"
        value={installment.amount ?? ""}
        placeholder="e.g. 1000"
        onChange={(event) => {
          const nextValue = event.target.value;
          onAmountChange(nextValue === "" ? null : Number(nextValue));
        }}
      />
      <div className="flex items-end gap-4 w-full">
        <div className="flex-1">
          <InputField
            type="date"
            id={`date_${id}`}
            label="Date"
            value={toDateInputValue(installment.date)}
            placeholder="MM/DD/YYYY"
            onChange={(event) => onDateChange(toDateFromInput(event.target.value))}
          />
        </div>
        {showDelete ? (
          <div
                  className={`rounded-full mb-3 bg-red hover:bg-red-light w-fit p-1 hover:cursor-pointer active:bg-red active:!border-red`}
                  onClick={onDelete}
                >
                  <FaXmark className="text-white text-xs lg:text-base" />
                </div>
        ) : (
          <div className="hidden xl:block w-8 h-8 shrink-0" />
        )}
      </div>
    </div>
  );
}
