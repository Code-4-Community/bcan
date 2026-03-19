import InputField from "../../../components/InputField";

export default function CashPosition() {
  return (
    <div className="chart-container col-span-2 h-full">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {"Starting Cash Position"}
      </div>
      <InputField
        type="number"
        id="starting_balance"
        label="Current Cash Balance"
        value={"25000"}
      />
    </div>
  );
}
