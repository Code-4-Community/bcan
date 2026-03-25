import InputField from "../../../components/InputField";
import { observer } from "mobx-react-lite";
import { getAppStore } from "../../../external/bcanSatchel/store";
import { setCashflowSettings } from "../../../external/bcanSatchel/actions";

const CashAnnualSettings = observer(() => {

  const { cashflowSettings } = getAppStore();

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cashflowSettings) return;
    setCashflowSettings({
      ...cashflowSettings,
      salaryIncrease: e.target.valueAsNumber,
    });
  };

  const handleBenefitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cashflowSettings) return;
    setCashflowSettings({
      ...cashflowSettings,
      benefitsIncrease: e.target.valueAsNumber,
    });
  };

  return (
    <div className="chart-container col-span-2 h-full">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {"Annual Increase Settings"}
      </div>
      <div className="flex flex-row justify-between gap-4">
        <InputField
          type="number"
          id="salary_increase"
          label="Personnel Salary Increase (%)"
          value={cashflowSettings?.salaryIncrease ?? 0}
          onChange={handleSalaryChange}
          className=""
        />
        <InputField
          type="number"
          id="benefits_increase"
          label="Personnel Benefits Increase (%)"
          value={cashflowSettings?.benefitsIncrease ?? 0}
          onChange={handleBenefitsChange}
        />
      </div>
    </div>
  );
});

export default CashAnnualSettings;
