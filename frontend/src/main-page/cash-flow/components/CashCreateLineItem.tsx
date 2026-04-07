import { useState } from "react";
import Button from "../../../components/Button";
import CashAddRevenue from "./CashAddRevenue";
import CashAddCosts from "./CashAddCosts";

export default function CashCreateLineItem() {
  const [showCosts, setShowCosts] = useState<boolean>(false);
  const [pressedTab, setPressedTab] = useState<"Revenue" | "Costs" | null>(null);

  const highlightedRevenue =
    pressedTab === "Revenue" || (!showCosts && pressedTab !== "Costs");
  const highlightedCosts =
    pressedTab === "Costs" || (showCosts && pressedTab !== "Revenue");

  const setPressedFromEvent = (target: EventTarget | null) => {
    const button = (target as HTMLElement | null)?.closest("button");
    const text = button?.textContent?.trim();
    if (text === "Revenue" || text === "Costs") {
      setPressedTab(text);
    }
  };

  return (
    <div className="chart-container col-span-2 h-full">
      <div
        className="flex flex-row rounded-4xl p-1 border border-grey-500 mb-2 text-sm lg:text-base"
        onPointerDownCapture={(event) => setPressedFromEvent(event.target)}
        onPointerUpCapture={() => setPressedTab(null)}
        onPointerLeave={() => setPressedTab(null)}
        onPointerCancelCapture={() => setPressedTab(null)}
      >
        <Button
          text="Revenue"
          onClick={() => setShowCosts(false)}
          className={`w-1/2 font-semibold ${highlightedRevenue ? "bg-primary-900 text-white" : "bg-white"}`}
        />
        <Button
          text="Costs"
          onClick={() => setShowCosts(true)}
          className={`w-1/2 font-semibold ${highlightedCosts ? "bg-primary-900 text-white" : "bg-white"}`}
        />
      </div>

      <div className="">
        {!showCosts && <CashAddRevenue />}
        {showCosts && <CashAddCosts />}
      </div>
    </div>
  );
}
