import Button from "../../../../components/Button";
import { GrantFormState } from "../EditGrant";
import { TDateISO } from "../../../../../../backend/src/utils/date";
import { Action } from "../processGrantDataEditSave";
import {
  faCheckSquare,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";

type EditGrantProps = {
  form: GrantFormState;
  dispatch: React.Dispatch<Action>;
};

export default function EditGrantInfo({ form, dispatch }: EditGrantProps) {
  return (
    <div className="w-full">
      <div className="mb-6">
        <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
          Description
        </label>
        <textarea
          className="h-48 block w-full text-gray-700 border bg-white border-grey-300 rounded placeholder:text-gray-700 p-2"
          placeholder="Enter grant description..."
          value={form.description}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "description",
              value: e.target.value,
            })
          }
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full gap-4">
        {/* Left Column */}
        <div className="flex flex-col w-full gap-6 items-start text-left col-span-1">
          {/* Amount */}
          <div className="w-3/4">
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              min={0}
              className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.amount}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "amount",
                  value: e.target.value,
                })
              }
            />
          </div>

          {/* BCAN Eligible */}
          <div className="w-fit">
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1 whitespace-nowrap">
              BCAN Eligible?
            </label>
            <div className="flex flex-col gap-1">
              <Button
                logo={faCheckSquare}
                logoPosition="left"
                text="Yes"
                className={`text-gray-700 px-3 py-1 text-sm border-2 active:bg-white ${form.doesBcanQualify === "yes" ? "text-green border-green" : "border-grey-300 text-grey-700"}`}
                onClick={() =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "doesBcanQualify",
                    value: "yes",
                  })
                }
              />
              <Button
                logo={faSquareXmark}
                logoPosition="left"
                text="No"
                className={`text-gray-700 px-3 py-1 text-sm border-2 active:bg-white ${form.doesBcanQualify === "no" ? "text-red border-red" : "border-grey-300 text-grey-700"}`}
                onClick={() =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "doesBcanQualify",
                    value: "no",
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Center Column - Dates */}
        <div className="flex flex-col w-full gap-6 items-start text-left col-span-1">
          {/* Due Date */}
          <div className="">
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.dueDate}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "dueDate",
                  value: e.target.value as TDateISO,
                })
              }
            />
          </div>
          {/* Application Date */}
          <div className="">
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Application Date
            </label>
            <input
              type="date"
              className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.applicationDate}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "applicationDate",
                  value: e.target.value as TDateISO,
                })
              }
            />
          </div>
        </div>
        {/* Right Column */}
        <div className="flex flex-col w-full gap-6 items-start text-left col-span-1">
          {/* Grant Start Date */}
          <div>
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Grant Start Date
            </label>
            <input
              type="date"
              className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.grantStartDate}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "grantStartDate",
                  value: e.target.value as TDateISO,
                })
              }
            />
          </div>

          {/* Report Deadlines */}
          <div>
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1 ">
              Report Deadlines
            </label>
            <input
              type="date"
              className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4 "
            />
          </div>
        </div>
        <div className="flex flex-col w-full gap-6 items-start text-left col-span-1">
          {/* Estimated Completion Time */}
          <div className="">
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1 whitespace-nowrap">
              Estimated Completion Time (hours)
            </label>
            <input
              type="number"
              min="0"
              className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.estimatedCompletionTime}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "estimatedCompletionTime",
                  value: e.target.value,
                })
              }
            />
          </div>

          {/* Timeline */}
          <div className="">
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1 ">
              Timeline (years)
            </label>
            <input
              type="number"
              min="0"
              className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.timeline}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "timeline",
                  value: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
