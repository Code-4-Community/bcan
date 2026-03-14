import { InputField } from "../../../../sign-up";
import Button from "../../../../components/Button";
import { Action } from "../processGrantDataEditSave";
import { GrantFormState } from "../EditGrant";
import { useEffect, useState } from "react";
import { updateUserQuery } from "../../../../external/bcanSatchel/actions";
import UserSearch from "../../../../main-page/users/UserSearch";
import { ProcessUserData } from "../../../../main-page/users/processUserData";
import { observer } from "mobx-react-lite";
import logo from "../../../../images/logo.svg";

type AddPopupProps = {
  setShowPopup: () => void;
  dispatch: React.Dispatch<Action>;
  form: GrantFormState;
};

type ContactType = "BCAN" | "Granter";

const AddContactPopup = observer(
  ({ setShowPopup, dispatch, form }: AddPopupProps) => {
    const [type, setType] = useState<ContactType>(
      form.bcanPocEmail ? "Granter" : "BCAN",
    );
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const { activeUsers } = ProcessUserData();

    useEffect(() => {
      updateUserQuery("");
    }, []);

    const validateUser = () => {
      if (!selectedUser) {
        setError("No user selected");
        return false;
      }

      if (!selectedUser.firstName) {
        setError("firstName");
        return false;
      }

      if (!selectedUser.lastName) {
        setError("lastName");
        return false;
      }

      if (!emailRegex.test(selectedUser.email)) {
        setError("email");
        return false;
      }

      setError(null);
      return true;
    };

    const handleAdd = () => {
      if (!validateUser() || !selectedUser) return;

      const name = `${selectedUser.firstName} ${selectedUser.lastName}`;

      if (type === "BCAN") {
        dispatch({
          type: "SET_FIELD",
          field: "bcanPocEmail",
          value: selectedUser.email,
        });
        dispatch({ type: "SET_FIELD", field: "bcanPocName", value: name });
      } else {
        dispatch({
          type: "SET_FIELD",
          field: "grantProviderPocEmail",
          value: selectedUser.email,
        });
        dispatch({
          type: "SET_FIELD",
          field: "grantProviderPocName",
          value: name,
        });
      }

      setShowPopup();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col bg-white rounded-md px-8 py-6 max-w-xl mx-4 gap-3 w-full h-[35rem]">
          <div className="text-2xl font-bold text-start">Add Contact</div>

          {/* Contact Type Selector */}
          <div className="flex gap-2">
            {(["BCAN", "Granter"] as ContactType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setSelectedUser(null);
                  setError(null);
                }}
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

              <div className="flex flex-col gap-2 max-h-64 overflow-y-scroll rounded justify-items-start text-start">
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
                    <div className="flex flex-row">
                    <img
                      src={user.profilePicUrl || logo}
                      alt="Profile"
                      className="w-10 h-10 object-cover ml-2 mr-4 rounded-full aspect-square block"
                    />
                    <div>
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>

                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  </div>
                  </div>
                ))}
              </div>

              {selectedUser && (
                <div className="text-sm text-gray-600 mt-4">
                  Selected: {selectedUser.firstName} {selectedUser.lastName}
                </div>
              )}
            </div>
          )}

          {/* GRANTER FORM */}
          {type === "Granter" && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex gap-2">
                <InputField
                  id="firstName"
                  label="First Name"
                  placeholder="Enter first name..."
                  required
                  error={error === "firstName"}
                  onChange={(e) => {
                    setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value,
                    });
                  }}
                />

                <InputField
                  id="lastName"
                  label="Last Name"
                  placeholder="Enter last name..."
                  required
                  error={error === "lastName"}
                  onChange={(e) => {
                    setSelectedUser({
                      ...selectedUser,
                      lastName: e.target.value,
                    });
                  }}
                />
              </div>

              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="Enter email address..."
                required
                error={error === "email"}
                onChange={(e) => {
                  setSelectedUser({ ...selectedUser, email: e.target.value });
                }}
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
              disabled={
                !(
                  selectedUser &&
                  selectedUser.firstName &&
                  selectedUser.lastName &&
                  selectedUser.email
                )
              }
              className="text-white bg-primary-900 text-sm"
            />
          </div>
        </div>
      </div>
    );
  },
);

export default AddContactPopup;
