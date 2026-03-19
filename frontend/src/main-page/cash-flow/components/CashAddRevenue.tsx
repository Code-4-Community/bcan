import Button from "../../../components/Button";
import InputField from "../../../components/InputField";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function CashAddRevenue() {
  return (
    <div className="flex flex-col pt-2 px-2 col-span-2 h-full gap-2">
      <div className="text-lg lg:text-xl w-full text-left font-bold">
        {"Add Revenue Source"}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full justify-between gap-4">
        <div className="flex flex-col col-span-1 w-full gap-2">
          <InputField
            id="category"
            label="Category"
            value={"Select Category"}
            className=""
          />
          <InputField
            type="number"
            id="amount"
            label="Amount ($)"
            value={"325000"}
          />
        </div>
        <div className="flex flex-col col-span-1 gap-2">
          <InputField
            type="text"
            id="source_name"
            label="Revenue Source Name"
            value={"Foundation Grant"}
          />
          <InputField
            type="date"
            id="date"
            label="Date"
            value={new Date().toDateString()}
          />
        </div>
      </div>
      <Button
        text="Add Installment"
        onClick={() => alert("add installment")}
        logo={faPlus}
        logoPosition="left"
        className="bg-primary-900 text-white w-fit ml-auto text-sm"
      />
      <Button
        text="Add Revenue Source"
        onClick={() => alert("add revenue source")}
        className="bg-green text-white mt-2"
      />
    </div>
  );
}
