import { InputField } from "../../../../sign-up";
import Button from "../../../../components/Button";
import { Action } from "../processGrantDataEditSave";
import { GrantFormState } from "../EditGrant";
import { useEffect, useState } from "react";
import { updateUserQuery } from "../../../../external/bcanSatchel/actions";
import UserSearch from "../../../../main-page/users/UserSearch";
import { ProcessUserData } from "../../../../main-page/users/processUserData";
import { observer } from "mobx-react-lite";

type AddPopupProps = {
  setShowPopup: () => void;
  dispatch: React.Dispatch<Action>;
  form: GrantFormState;
};

type ContactType = "BCAN" | "Granter";

const AddContactPopup = observer(
  ({ setShowPopup, dispatch, form }: AddPopupProps) => {
    const [type, setType] = useState<ContactType>(form.bcanPocEmail ? "Granter" : "BCAN");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    const { activeUsers } = ProcessUserData();

    useEffect(() => {
      updateUserQuery("");
    }, []);

    const handleAdd = () => {
      if (type === "BCAN" && selectedUser) {
        dispatch({
          type: "SET_FIELD",
          field: "bcanPocEmail",
          value: selectedUser.email,
        });

        dispatch({
          type: "SET_FIELD",
          field: "bcanPocName",
          value: `${selectedUser.firstName} ${selectedUser.lastName}`,
        });
      }

      setShowPopup();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col bg-white rounded-md px-8 py-6 max-w-xl mx-4 gap-3 w-full h-[40%]">

          <div className="text-2xl font-bold text-start">Add Contact</div>

          {/* Contact Type Selector */}
          <div className="flex gap-2">
            {(["BCAN", "Granter"] as ContactType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 px-3 text-xs rounded-full border
                  ${
                    type === t
                      ? t === "BCAN"
                        ? "bg-primary-900 text-white"
                        : "bg-secondary-500 text-white"
                      : "bg-white border-grey-400"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* BCAN USER PICKER */}
          {type === "BCAN" && (
            <div className="flex flex-col mt-2 gap-2">
              <UserSearch />

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto rounded justify-items-start text-start">

                {activeUsers.map((user) => (
                  <div
                    key={user.email}
                    onClick={() => setSelectedUser(user)}
                    className={`p-2 rounded cursor-pointer border border-grey-300
                      ${
                        selectedUser?.email === user.email
                          ? "border-primary-900"
                          : "hover:bg-grey-100"
                      }`}
                  >
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>

                    <div className="text-xs text-gray-500">
                      {user.email}
                    </div>
                  </div>
                ))}
              </div>

              {selectedUser && (
                <div className="text-sm text-gray-600 mt-2">
                  Selected: {selectedUser.firstName} {selectedUser.lastName}
                </div>
              )}
            </div>
          )}

          {/* GRANTER FORM */}
          {type === "Granter" && (
            <div className="flex flex-col gap-2">

              <div className="flex gap-2">
                <InputField
                  id="firstName"
                  label="First Name"
                  placeholder="Enter first name..."
                  required
                />

                <InputField
                  id="lastName"
                  label="Last Name"
                  placeholder="Enter last name..."
                  required
                />
              </div>

              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="Enter email address..."
                required
              />
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-2 mt-auto">
            <Button
              text="Cancel"
              onClick={setShowPopup}
              className="text-black border-grey-500 text-sm"
            />

            <Button
              text="Add"
              onClick={handleAdd}
              className="text-white bg-primary-900 text-sm"
            />
          </div>

        </div>
      </div>
    );
  }
);

export default AddContactPopup;