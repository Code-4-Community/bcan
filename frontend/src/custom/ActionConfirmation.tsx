import { IoIosWarning } from "react-icons/io";

{/* The popup that appears on delete */}
  const ActionConfirmation = ({ 
    isOpen, 
    onCloseDelete, 
    onConfirmDelete, 
    title,
    subtitle = "Are you sure?",
    boldSubtitle = "",
    warningMessage = "This action cannot be undone."
  }: {
    isOpen: boolean;
    onCloseDelete: () => void;
    onConfirmDelete: () => void;
    title: string;
    subtitle: string;
    boldSubtitle : string;
    warningMessage: string;
  }) => {
    if (!isOpen) return null;

    return (
      <div 
        className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
        onClick={onCloseDelete}
      >
        <div 
          className=" bg-white border-2 rounded-md shadow-2xl p-8 max-w-xl w-full mx-4 transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Title */}
          <h3 className="text-2xl font-bold text-black text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6 text-lg">
            {subtitle + " "} 
            <span className="font-bold">{boldSubtitle}</span>
            {"?"}
          </p>

          <div className="max-w-md mx-auto ">

            <div className="flex mb-6">

            <div className="w-3 bg-red"/>
            <div  className="p-3 bg-red-lightest">
            <div className="flex">
              <IoIosWarning size={24} className="text-red-dark"/>
              <p className="font-bold px-1 text-lg text-red-dark"> Warning </p>
            </div>
            <p className=" text-left text-lg font-semibold text-red">
              {warningMessage}
            </p>

            </div>

          </div>
          

          {/* Buttons */}
          <div className="flex w-full justify-between ">
            <button
              className="rounded-lg hover:bg-gray-200 border-2 border-black bg-red-lightest transition-colors w-32 h-12"
              onClick={onCloseDelete}
            >
              No, cancel
            </button>
            <button
              className="rounded-lg text-black border-2 border-black hover:bg-red-700 transition-colors w-32 h-12"
              onClick={() => {
                onConfirmDelete();
                onCloseDelete();
              }}
            >
              Yes, confirm
            </button>
          </div>

          </div>
          
        </div>
      </div>
    );
  };

  export default ActionConfirmation;