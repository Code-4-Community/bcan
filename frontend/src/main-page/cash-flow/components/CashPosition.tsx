import InputField from "../../../components/InputField";
import { observer } from "mobx-react-lite";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { setCashflowSettings } from "../../../external/bcanSatchel/actions";

const CashPosition = observer(() => {

  const { cashflowSettings } = getAppStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cashflowSettings) return;
    setCashflowSettings({
      ...cashflowSettings,
      startingCash: e.target.valueAsNumber,
    });
  };

  return (
    <div className="chart-container col-span-2 h-full">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {"Starting Cash Position"}
      </div>
      <InputField
        type="number"
        id="starting_balance"
        label="Current Cash Balance"
        value={cashflowSettings?.startingCash ?? 0}
        onChange={handleChange}
      />
    </div>
  );
});

export default CashPosition;