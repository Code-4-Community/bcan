import Button from "../../../../components/Button";

type ErrorPopupProps = {
  message: string;
  setShowErrorPopup: () => void;
};

export default function ErrorPopup({
  message,
  setShowErrorPopup,
}: ErrorPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center justify-items-center z-50">
      <div className="bg-white rounded-md px-12 py-8 max-w-md mx-4 border-2 border-grey-700 grid place-items-center">
        <h3 className="text-xl font-bold mb-2">Error</h3>
        <p className="mb-4">{message}</p>
        <Button
          text="Close"
          onClick={setShowErrorPopup}
          className="text-white bg-primary-900"
        />
      </div>
    </div>
  );
}
