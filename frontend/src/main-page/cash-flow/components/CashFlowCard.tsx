import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type CardProps = {
  text: string;
  value: string;
  className: string;
  logo: IconProp;
  size?: "small" | "medium";
};

export default function CashFlowCard({
  text,
  value,
  className,
  logo,
  size,
}: CardProps) {
  return (
    <div className="flex  flex-col bg-white rounded-md py-4 px-6">
      <div className="flex flex-row justify-between mb-1 lg:mb-2">
        <div className="text-md lg:text-lg  w-full text-left font-semibold">
          {text}
        </div>
        <FontAwesomeIcon
          icon={logo}
          className="text-lg w-4 h-4 justify-self-end hidden lg:block"
        />
      </div>
      <div
        className={`font-semibold text-start mt-auto  ${className} ${size == "small" ? "text-sm lg:text-base" : "text-lg lg:text-2xl"}`}
      >
        {value}
      </div>
    </div>
  );
}
