import Button from "../../../../components/Button";
import { GrantFormState } from "../EditGrant";
import { TDateISO } from "../../../../../../backend/src/utils/date";
import { Action } from "../processGrantDataEditSave";
import { faCheckSquare, faSquareXmark } from "@fortawesome/free-solid-svg-icons";

type EditGrantProps = {
  form: GrantFormState;
  dispatch: React.Dispatch<Action>
};

export default function EditGrantInfo({ form, dispatch }: EditGrantProps) {
  return (
    <div className="w-full">
      <div className="">
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
          <div className="flex mt-5 items-start">
            {/* Left Column */}
            <div className="w-1/3 pr-9">
              {/* Amount */}
              <div className="w-1/2 mb-4">
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
              <div className="w-1/4">
                <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1 whitespace-nowrap">
                  BCAN Eligible?
                </label>
                <div className="flex flex-col space-y-2">
                  <Button
                    logo={faCheckSquare}
                    logoPosition="left"
                    text="Yes"
                    className={`text-gray-700 px-3 py-1 text-sm border-2 active:bg-white ${form.doesBcanQualify === "yes" ? "text-green border-green" : "border-grey-300"}`}
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
                    className={`text-gray-700 px-3 py-1 text-sm border-2 active:bg-white ${form.doesBcanQualify === "no" ? "text-red border-red" : "border-grey-300"}`}
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
            <div className="w-1/6 px-2 -ml-44">
              {/* Due Date */}
              <div className="mb-4">
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
              <div className="mb-4">
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
            <div className="w-1/3 pl-7">
              <div className="grid grid-cols-2 gap-4 ">
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

                {/* Estimated Completion Time */}
                <div className="pl-7">
                  <label className="flex text-gray-700 text-s mb-1 whitespace-nowrap">
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

                {/* Timeline */}
                <div className="pl-7">
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
    </div>
  );
}
