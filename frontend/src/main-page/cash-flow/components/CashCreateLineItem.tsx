import { useState } from "react";
import Button from "../../../components/Button";
import CashAddRevenue from "./CashAddRevenue";
import CashAddCosts from "./CashAddCosts";

export default function CashCreateLineItem() {
  const [showCosts, setShowCosts] = useState<boolean>(false);

  return (
    <div className="chart-container col-span-2 h-full">
      <div className="flex flex-row rounded-4xl p-1 border border-grey-500 mb-2">
        <Button
          text="Revenue"
          onClick={() => setShowCosts(!showCosts)}
          className={`w-1/2 font-semibold ${!showCosts ? "bg-primary-900 text-white" : "bg-white"}`}
        />
        <Button
          text="Costs"
          onClick={() => setShowCosts(!showCosts)}
          className={`w-1/2 font-semibold ${showCosts ? "bg-primary-900 text-white" : "bg-white"}`}
        />
      </div>

      <div className="">
        {!showCosts && <CashAddRevenue />}
        {showCosts && <CashAddCosts />}
      </div>
    </div>
  );
}
