import InputField from "../../../components/InputField";

export default function CashAnnualSettings() {
  return (
    <div className="chart-container col-span-2 h-full">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {"Annual Increase Settings"}
      </div>
      <div className="flex flex-row justify-between gap-6">
        <InputField
          type="number"
          id="salary_increase"
          label="Personnel Salary Increase (%)"
          value={"3.5"}
          className=""
        />
        <InputField
          type="number"
          id="benefits_increase"
          label="Personnel Benefits Increase (%)"
          value={"4.0"}
        />
      </div>
    </div>
  );
}
