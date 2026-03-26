import InputField from "../../../components/InputField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

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
          <button
            type="button"
            aria-label="Delete installment"
            onClick={onDelete}
            className="rounded-full bg-red hover:bg-red-light text-white w-10 h-10 flex items-center justify-center mb-0.5 shrink-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-lg" />
          </button>
        ) : (
          <div className="hidden xl:block w-10 h-10 shrink-0" />
        )}
      </div>
    </div>
  );
}
