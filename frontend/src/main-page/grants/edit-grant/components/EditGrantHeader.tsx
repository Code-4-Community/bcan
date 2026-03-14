import { GrantFormState } from "../EditGrant";
import { Action } from "../processGrantDataEditSave";
import StatusIndicator from "../../grant-view/StatusIndicator";
import { Status } from "../../../../../../middle-layer/types/Status";

type EditGrantProps = {
  form: GrantFormState;
  dispatch: React.Dispatch<Action>;
};

const buttonOptions = [
  { id: Status.Active, label: "Active" },
  { id: Status.Pending, label: "Pending" },
  { id: Status.Potential, label: "Potential" },
  { id: Status.Rejected, label: "Rejected" },
  { id: Status.Inactive, label: "Inactive" },
];

export default function EditGrantHeader({ form, dispatch }: EditGrantProps) {
  return (
    <div className="w-full">
      <div className="w-full pr-4">
        <input
          className="block w-full  lg:w-[80%] text-gray-700 text-2xl border-2 bg-white border-grey-300 rounded placeholder:text-gray-700 px-3 py-2 font-bold resize-none"
          placeholder="Enter grant name..."
          value={form.organization}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "organization",
              value: e.target.value,
            })
          }
        />
      </div>
      {/* 5 Horizontal Buttons */}
      <div className="flex flex-row flex-wrap gap-2 mt-3">
        {buttonOptions.map((btn) => (
          <div>
            <StatusIndicator
              curStatus={btn.id}
              active={btn.id === form.status}
              onClick={() =>
                dispatch({
                  type: "SET_FIELD",
                  field: "status",
                  value: btn.id,
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
