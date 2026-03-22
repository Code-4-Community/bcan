import { useState } from "react";
import Button from "../../../components/Button";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

type CashEditLineItemProps = {
  cardText: React.ReactNode;
  children: React.ReactNode;
  sourceName: string;
  onRemove: () => void;
};

export default function CashEditLineItem({
  cardText,
  children,
  sourceName,
  onRemove,
}: CashEditLineItemProps) {
  const [editting, setEditing] = useState<Boolean>(false);

  const onEdit = () => {
    setEditing(true);
  };

  return (
    <div className="rounded border border-grey-500 p-4">
      {!editting && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="flex flex-col text-start">
            <div className="text-lg lg:text-xl font-bold">{sourceName}</div>
            {cardText}
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
      )}
      {editting && <div>{children}</div>}
    </div>
  );
}
