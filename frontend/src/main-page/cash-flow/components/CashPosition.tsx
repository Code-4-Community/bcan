import InputField from "../../../components/InputField";
import { observer } from "mobx-react-lite";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { setCashflowSettings } from "../../../external/bcanSatchel/actions";
import { TDateISO } from "../../../../../backend/src/utils/date";

const CashPosition = observer(() => {
  const { cashflowSettings } = getAppStore();

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cashflowSettings) return;
    setCashflowSettings({
      ...cashflowSettings,
      startingCash: e.target.valueAsNumber,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cashflowSettings) return;
    setCashflowSettings({
      ...cashflowSettings,
      startDate: e.target.value as TDateISO,
    });
  };

  return (
    <div className="chart-container col-span-2 h-full">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {"Starting Cash Position"}
      </div>
      <div className="flex flex-row justify-between gap-4">
        <InputField
          type="number"
          id="starting_balance"
          label="Current Cash Balance"
          value={cashflowSettings?.startingCash ?? 0}
          onChange={handleBalanceChange}
        />
        <InputField
          type="date"
          id="start_date"
          label="Projection Start Date"
          value={
            cashflowSettings?.startDate
              ? new Date(cashflowSettings.startDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]
          }
          onChange={handleDateChange}
        />
      </div>
    </div>
  );
});

export default CashPosition;
