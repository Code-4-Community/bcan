import CashEditLineItem from "./CashEditLineItem";

type SourceProps = {
    text: string;
}


export default function CashSourceList({ text}: SourceProps) {
  return (
    <div className="chart-container col-span-2 h-full">
          <div className="text-lg lg:text-xl mb-2 w-full text-left font-bold">
            {text}
          </div>
          <CashEditLineItem/>
        </div>
  );
}