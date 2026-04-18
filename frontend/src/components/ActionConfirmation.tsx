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
          panel: "border-t-4 border-green bg-green-light/30",
          stripe: "bg-green",
          box: "bg-green-light",
          Icon: FaCheckCircle,
          iconClass: "text-green",
          label: "Confirm",
          labelClass: "text-green",
          textClass: "text-green-dark",
          cancelClass:
            "text-grey-700 border-grey-500 hover:border-grey-600 hover:bg-grey-150 active:bg-grey-200",
        }
      : variant === "update"
        ? {
            panel: "border-t-4 border-grey-400 bg-grey-150",
            stripe: "bg-grey-500",
            box: "bg-grey-200",
            Icon: FaInfoCircle,
            iconClass: "text-grey-700",
            label: "Review",
            labelClass: "text-grey-800",
            textClass: "text-grey-800",
            cancelClass:
              "text-grey-700 border-grey-500 hover:border-grey-600 hover:bg-grey-200 active:bg-grey-300",
          }
        : {
            panel: "border-t-4 border-red bg-red-lightest/40",
            stripe: "bg-red",
            box: "bg-red-light",
            Icon: IoIosWarning,
            iconClass: "text-red",
            label: "Warning",
            labelClass: "text-red",
            textClass: "text-red",
            cancelClass:
              "text-red border-red hover:border-red hover:bg-red-light active:bg-red",
          };

  const { Icon } = styles;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1500] transition-opacity duration-300"
      onClick={onCloseDelete}
    >
      <div
        className={`rounded-md shadow-2xl p-8 max-w-xl w-full mx-4 transform transition-all duration-300 !bg-white ${styles.panel}`}
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
            <div className={`w-3 shrink-0 ${styles.stripe}`} />
            <div className={`p-3 flex-1 min-w-0 ${styles.box}`}>
              <div className="flex items-center">
                <Icon size={24} className={`shrink-0 ${styles.iconClass}`} />
                <p className={`font-bold px-1 text-lg ${styles.labelClass}`}>
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
              className="border-grey-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmation;
