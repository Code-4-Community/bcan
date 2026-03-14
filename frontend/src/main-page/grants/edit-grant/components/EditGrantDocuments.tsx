import Button from "../../../../components/Button";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { GrantFormState } from "../EditGrant";
import { Action } from "../processGrantDataEditSave";
import EditGrantDeleteItem from "./EditGrantDeleteItem";
import { useState } from "react";
import AddAttachmentPopup from "./AddAttachmentPopup";

type EditGrantProps = {
  form: GrantFormState;
  dispatch: React.Dispatch<Action>;
};

export const EditGrantDocuments = ({ dispatch, form }: EditGrantProps) => {

const [showPopup, setShowPopup] = useState<boolean>(false);

  return (
    <div className="w-full">
      <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
        Documents
      </label>
      <div className="columns-2 xl:columns-4 gap-6 space-y-2 lg:w-[90%] ml-2">
        {form.attachments.map((attachment, index) => (
          <EditGrantDeleteItem
            item={
              <div key={index} className="flex flex-col">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-[2.25rem] px-5 flex items-center border border-grey-300 rounded-md text-secondary underline truncate"
                >
                  {attachment.attachment_name || attachment.url}
                </a>
              </div>
            }
            onDelete={() =>
              dispatch({ type: "REMOVE_ATTACHMENT", index: index })
            }
          />
        ))}
      </div>
      <Button
        logo={faPlus}
        logoPosition="left"
        text="Add"
        className="text-white bg-primary-900 text-xs mt-2"
        onClick={() => setShowPopup(true)}
      />
      {showPopup && (
          <AddAttachmentPopup
            dispatch={dispatch}
            setShowPopup={() => setShowPopup(false)}
          />
        )}
    </div>
  );
};
