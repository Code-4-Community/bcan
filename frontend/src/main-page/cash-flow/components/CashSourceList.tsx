import CashEditLineItem from "./CashEditLineItem";

type SourceProps = {
  type: "Revenue" | "Cost";
};

export default function CashSourceList({ type }: SourceProps) {
  return (
    <div className="chart-container col-span-2 h-full">
      <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
        {type}
        {" Sources"}
      </div>
      {/* map over list of source and put casheditlineitem for each */}
      <CashEditLineItem
        cardText={
          <div className="flex flex-col text-sm lg:text-base">
            <div className="font-semibold">{"Individual Donations"}</div>
            <div>{"$10,000 | 3/13/2323"}</div>
          </div>
        }
        sourceName="Source Name"
        onRemove={() => alert("remove")}
      >
        <div>{"Edit form"}</div>
      </CashEditLineItem>
    </div>
  );
}
