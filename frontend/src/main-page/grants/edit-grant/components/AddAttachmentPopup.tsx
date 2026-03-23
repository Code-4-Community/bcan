import { InputField } from "../../../../sign-up";
import Button from "../../../../components/Button";
import { Action } from "../processGrantDataEditSave";
import { useState } from "react";
import { observer } from "mobx-react-lite";

type AddPopupProps = {
  setShowPopup: () => void;
  dispatch: React.Dispatch<Action>;
};

const AddAttachmentPopup = observer(
  ({ setShowPopup, dispatch }: AddPopupProps) => {
    const [attachment, setAttachment] = useState<any>(null);

    const handleAdd = () => {
      dispatch({
        type: "ADD_ATTACHMENT",
        attachment: { ...attachment },
      });

      setShowPopup();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col bg-white rounded-md px-8 py-6 max-w-xl mx-4 gap-3 w-full">
          <div className="text-2xl font-bold text-start">Add Attachment</div>

          <div className="gap-2 flex flex-col">
            <InputField
              id="name"
              label="Link Title"
              placeholder="Enter link title..."
              required
              onChange={(e) => {
                setAttachment({
                  ...attachment,
                  attachment_name: e.target.value,
                });
              }}
            />

            <InputField
              id="url"
              label="Link"
              type="url"
              placeholder="Enter link URL..."
              required
              onChange={(e) => {
                let value = e.target.value.trim();

                if (value && !/^https?:\/\//i.test(value)) {
                  value = `https://${value}`;
                }

                setAttachment({
                  ...attachment,
                  url: value,
                });
              }}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              text="Cancel"
              onClick={setShowPopup}
              className="text-black border-grey-500 text-sm"
            />

            <Button
              text="Add"
              onClick={handleAdd}
              disabled={
                !(attachment && attachment.attachment_name && attachment.url)
              }
              className="text-white bg-primary-900 text-sm"
            />
          </div>
        </div>
      </div>
    );
  },
);

export default AddAttachmentPopup;
