import Button from "../../../../components/Button";
import { GrantFormState } from "../EditGrant";
import { TDateISO } from "../../../../../../backend/src/utils/date";
import { Action } from "../processGrantDataEditSave";
import {
  faCheckSquare,
  faPlus,
  faSquareXmark,
} from "@fortawesome/free-solid-svg-icons";
import EditGrantDeleteItem from "./EditGrantDeleteItem";
import FieldLabel from "../../../../components/FieldLabel";

type EditGrantProps = {
  form: GrantFormState;
  dispatch: React.Dispatch<Action>;
};

export default function EditGrantInfo({ form, dispatch }: EditGrantProps) {
  return (
    <div className="w-full">
      <div className="mb-6">
        <FieldLabel className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
          Description
        </FieldLabel>
        <textarea
          className="h-32 block w-full text-gray-700 border bg-white border-grey-300 rounded placeholder:text-gray-700 p-2"
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
            <FieldLabel isRequired className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Amount ($)
            </FieldLabel>
            <input
              type="number"
              min={0}
              className="appearance-none block w-full h-[2.25rem] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.amount}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "amount",
                  value: e.target.valueAsNumber,
                })
              }
            />
          </div>

          {/* BCAN Eligible */}
          <div className="w-fit">
            <FieldLabel isRequired className="flex text-gray-700 sm:text-sm lg:text-base mb-1 whitespace-nowrap">
              BCAN Eligible?
            </FieldLabel>
            <div className="flex flex-col gap-1">
              <Button
                logo={faCheckSquare}
                logoPosition="left"
                text="Yes"
                className={`text-gray-700 px-2 py-1 w-20 text-sm border-2  hover:!border-green active:!bg-green ${form.doesBcanQualify === "yes" ? "text-green border-green" : "border-grey-300 text-grey-700"}`}
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
                className={`text-gray-700 px-2 py-1 w-20 text-sm border-2 hover:!border-red active:bg-red ${form.doesBcanQualify === "no" ? "text-red border-red" : "border-grey-300 text-grey-700"}`}
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
            <FieldLabel className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Due Date
            </FieldLabel>
            <input
              type="date"
              className="appearance-none block w-full h-[2.25rem] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.applicationDeadline}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "applicationDeadline",
                  value: e.target.value as TDateISO,
                })
              }
            />
          </div>
          {/* Application Date */}
          <div className="">
            <FieldLabel className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Application Date
            </FieldLabel>
            <input
              type="date"
              className="appearance-none block w-full h-[2.25rem] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
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
            <FieldLabel className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Grant Start Date
            </FieldLabel>
            <input
              type="date"
              className="appearance-none block w-full h-[2.25rem] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
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
          <div className="">
            <FieldLabel className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Report Deadlines
            </FieldLabel>
            <div className="flex flex-col gap-2">
              <div className="ml-2 flex flex-col gap-2">
              {form.reportDates.map((date, index) => (
                <EditGrantDeleteItem
                  key={index}
                  item={
                    <input
                      type="date"
                      value={date}
                      onChange={(e) =>
                        dispatch({
                          type: "UPDATE_REPORT_DATE",
                          index: index,
                          value: e.target.value as TDateISO,
                        })
                      }
                      className="appearance-none block w-full h-[2.25rem] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4 "
                    />
                  }
                  onDelete={() =>
                    dispatch({ type: "REMOVE_REPORT_DATE", index: index })
                  }
                />
              ))}
              </div>
              <Button
                      logo={faPlus}
                      logoPosition="left"
                      text="Add"
                      className="text-white bg-primary-900 text-xs w-fit"
                      onClick={() =>
                        dispatch({
                          type: "ADD_REPORT_DATE",
                        })
                      }
                    />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full gap-6 items-start text-left col-span-1">
          {/* Timeline */}
          <div className="">
            <FieldLabel isRequired className="flex text-gray-700 sm:text-sm lg:text-base mb-1 ">
              Timeline (years)
            </FieldLabel>
            <input
              type="number"
              min="0"
              className="appearance-none block w-full h-[2.25rem] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.timeline}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "timeline",
                  value: e.target.valueAsNumber,
                })
              }
            />
          </div>
          {/* Estimated Completion Time */}
          <div className="">
            <FieldLabel className="flex text-gray-700 sm:text-sm lg:text-base mb-1 whitespace-nowrap">
              Estimated Completion Time (hours)
            </FieldLabel>
            <input
              type="number"
              min="0"
              className="appearance-none block h-[2.25rem] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
              value={form.estimatedCompletionTime}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "estimatedCompletionTime",
                  value: e.target.valueAsNumber,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
