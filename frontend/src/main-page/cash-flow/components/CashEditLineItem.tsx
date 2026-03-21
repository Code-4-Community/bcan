import Button from "../../../components/Button";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

type CashEditLineItemProps = {
  children: React.ReactNode;
  sourceName: string;
  onEdit: () => void;
  onRemove: () => void;
};

export default function CashEditLineItem({
  children,
  sourceName,
  onEdit,
  onRemove,
}: CashEditLineItemProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 rounded border border-grey-500 p-4 gap-2">
      <div className="flex flex-col text-start">
        <div className="text-lg lg:text-xl font-bold">
          {sourceName}
        </div>
        {children}
      </div>

      <div className="flex flex-wrap gap-2 lg:ml-auto">
        <Button
          text="Edit"
          onClick={onEdit}
          logo={faPenToSquare}
          logoPosition="right"
          className="bg-white text-black border-grey-500"
        />
        <Button
          text="Remove"
          logo={faTrash}
          logoPosition="right"
          onClick={onRemove}
          className="bg-red-light text-red"
        />
      </div>
    </div>
  );
}