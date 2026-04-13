import { useState } from "react";
import Button from "../../../components/Button";
import { faTrash, faPenToSquare, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ActionConfirmation from "../../../components/ActionConfirmation";

type CashEditLineItemProps = {
  cardText: React.ReactNode;
  children: (onClose: () => void) => React.ReactNode;
  sourceName: string;
  onRemove: () => Promise<void>;
  isReadOnly: boolean;
  onReadOnlyAction?: () => void;
};

export default function CashEditLineItem({
  cardText,
  children,
  sourceName,
  onRemove,
  isReadOnly,
  onReadOnlyAction,
}: CashEditLineItemProps) {
  const [editing, setEditing] = useState<boolean>(false);

  const onEdit = () => {
    setEditing(true);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    await onRemove();
    setShowDeleteModal(false);
  };

  return (
    <div className="rounded border border-grey-500 p-4">
      {!editing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="flex flex-col text-start">
            <div className="text-lg lg:text-xl font-bold">
              {sourceName}
            </div>
            {cardText}
          </div>

          <div className="flex flex-wrap gap-2 justify-end h-fit">
            {!isReadOnly && (
              <>
            <Button
              text="Edit"
              onClick={onEdit}
              logo={faPenToSquare}
              logoPosition="right"
              className="bg-white text-black border-grey-500 text-sm lg:text-base"
            />
            <Button
              text="Remove"
              logo={faTrash}
              logoPosition="right"
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-light text-red hover:!border-red text-sm lg:text-base"
            />
              </>
            )}
            {isReadOnly && (
            <Button
              text="Open in Grants"
              onClick={() => onReadOnlyAction?.()}
              logo={faArrowRight}
              logoPosition="right"
              className="bg-white text-black border-grey-500 text-sm lg:text-base"
            />
            )}
          </div>
        </div>
      )}
      {editing && <div>{children(() => setEditing(false))}</div>}
      <ActionConfirmation
        isOpen={showDeleteModal}
        onCloseDelete={() => setShowDeleteModal(false)}
        onConfirmDelete={() => {
          handleDelete();
        }}
        title={`Delete Cashflow Item`}
        subtitle={"Are you sure you want to delete"}
        boldSubtitle={sourceName}
        warningMessage="If you delete this item, it will be permanently removed from the system."
      />
    </div>
  );
}
