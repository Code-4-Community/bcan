import Button from "./Button";
import { IoIosWarning } from "react-icons/io";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";

export type ActionConfirmationVariant = "create" | "update" | "delete";

const ActionConfirmation = ({
  isOpen,
  onCloseDelete,
  onConfirmDelete,
  title,
  subtitle = "Are you sure?",
  boldSubtitle = "",
  warningMessage = "This action cannot be undone.",
  variant = "delete",
}: {
  isOpen: boolean;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  title: string;
  subtitle: string;
  boldSubtitle: string;
  warningMessage: string;
  variant?: ActionConfirmationVariant;
}) => {
  if (!isOpen) return null;

  const styles =
    variant === "create"
      ? {
          panel: "border-t-4 border-green",
          stripe: "bg-green",
          box: "bg-green-light",
          Icon: FaCheckCircle,
          iconClass: "text-green",
          label: "Confirm",
          labelClass: "text-green",
          textClass: "text-green-dark",
          cancelClass:
            "!border-2 active:!border-grey-500 border-grey-500 active:!bg-white text-black active:!text-grey-600 hover:!border-grey-600 hover:bg-grey-150 active:bg-grey-200",
          confirmClass:
            "!border-2 bg-green text-white hover:!border-green hover:bg-green-dark active:!bg-green-dark active:!bg-opacity-75 active:!border-green",
        }
      : variant === "update"
        ? {
            panel: "border-t-4 border-yellow",
            stripe: "bg-yellow",
            box: "bg-yellow-light",
            Icon: FaInfoCircle,
            iconClass: "text-yellow-dark",
            label: "Review",
            labelClass: "text-yellow-dark",
            textClass: "text-yellow-dark",
            cancelClass:
              "!border-2 active:!border-grey-500 border-grey-500 active:!bg-white text-black active:!text-grey-600 hover:!border-grey-600 hover:bg-grey-150 active:bg-grey-200",
            confirmClass:
              "!border-2 bg-yellow text-white hover:!border-yellow hover:bg-opacity-75 active:bg-yellow active:!border-yellow active:!bg-yellow-dark",
          }
        : {
            panel: "border-t-4 border-red",
            stripe: "bg-red",
            box: "bg-red-light",
            Icon: IoIosWarning,
            iconClass: "text-red",
            label: "Warning",
            labelClass: "text-red",
            textClass: "text-red",
            cancelClass:
              "!border-2 bg-red text-white hover:!border-red hover:bg-opacity-75 active:bg-red active:!border-red active:!bg-red-dark",
            confirmClass:
              "!border-2 active:!border-grey-500 border-grey-500 active:!bg-white text-black active:!text-grey-600 hover:!border-grey-600 hover:bg-grey-150 active:bg-grey-200",
          };

  const { Icon } = styles;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1500] transition-opacity duration-300"
      onClick={onCloseDelete}
    >
      <div
        className={`rounded-md shadow-2xl p-8 max-w-xl w-full mx-4 transform transition-all duration-300 bg-white ${styles.panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-black text-center mb-2">{title}</h3>

        <p className="text-gray-600 text-center mb-6 text-lg">
          {subtitle + " "}
          <span className="font-bold">{boldSubtitle}</span>
          {"?"}
        </p>

        <div className="max-w-md mx-auto ">
          <div className="flex mb-6">
            <div className={`w-1 shrink-0 ${styles.stripe}`} />
            <div className={`p-3 flex-1 min-w-0 ${styles.box}`}>
              <div className="flex items-center">
                <Icon size={20} className={`shrink-0 ${styles.iconClass}`} />
                <p className={`ml-1 font-bold px-1 text-lg ${styles.labelClass}`}>
                  {styles.label}
                </p>
              </div>
              <p className={`text-left font-semibold ${styles.textClass}`}>
                {warningMessage}
              </p>
            </div>
          </div>
          <div className="flex w-full justify-between ">
            <Button
              text="No, cancel"
              onClick={onCloseDelete}
              className={styles.cancelClass}
            />
            <Button
              text="Yes, confirm"
              onClick={() => {
                onConfirmDelete();
                onCloseDelete();
              }}
              className={styles.confirmClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmation;
