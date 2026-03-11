import { useEffect, useReducer, useState } from "react";
import Button from "../../../components/Button.tsx";
import {
  faCheckSquare,
  faSquareXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Grant } from "../../../../../middle-layer/types/Grant.ts";
import { observer } from "mobx-react-lite";
import { fetchGrants } from "./processGrantData.ts";
import { TDateISO } from "../../../../../backend/src/utils/date.ts";
import { Status } from "../../../../../middle-layer/types/Status.ts";
import Attachment from "../../../../../middle-layer/types/Attachment.ts";
import {
  createNewGrant,
  reducer,
  saveGrantEdits,
} from "../new-grant/processGrantDataEditSave.ts";

export interface GrantFormState {
  organization: string;
  applicationDate: TDateISO | "";
  grantStartDate: TDateISO | "";
  reportDates: (TDateISO | "")[];
  timeline: number;
  estimatedCompletionTime: number;
  doesBcanQualify: "yes" | "no" | "";
  isRestricted: "restricted" | "unrestricted" | "";
  status: Status | "";
  amount: number;
  description: string;
  attachments: Attachment[];
  bcanPocName: string;
  bcanPocEmail: string;
  grantProviderPocName: string;
  grantProviderPocEmail: string;
}

const EditGrant: React.FC<{
  grantToEdit: Grant | null;
  onClose: () => void;
  isOpen: boolean;
}> = observer(({ grantToEdit, onClose, isOpen }) => {
  // State to track if form was submitted successfully
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  // Add the useEffect
  useEffect(() => {
    if (!isOpen && wasSubmitted) {
      fetchGrants();
      setWasSubmitted(false); // Reset for next time
    }
  }, [isOpen, wasSubmitted]);

  const [form, dispatch] = useReducer(reducer, {
    organization: grantToEdit?.organization ?? "",
    applicationDate: grantToEdit?.application_deadline ?? "",
    grantStartDate: grantToEdit?.grant_start_date ?? "",
    reportDates: grantToEdit?.report_deadlines ?? [],
    timeline: grantToEdit?.timeline ?? 1,
    estimatedCompletionTime: grantToEdit?.estimated_completion_time ?? 10,
    doesBcanQualify: grantToEdit
      ? grantToEdit.does_bcan_qualify
        ? "yes"
        : "no"
      : "",
    isRestricted: grantToEdit
      ? grantToEdit.isRestricted
        ? "restricted"
        : "unrestricted"
      : "",
    status: grantToEdit?.status ?? "",
    amount: grantToEdit?.amount ?? 1000,
    description: grantToEdit?.description ?? "",
    attachments: grantToEdit?.attachments ?? [],
    bcanPocName: grantToEdit?.bcan_poc?.POC_name ?? "",
    bcanPocEmail: grantToEdit?.bcan_poc?.POC_email ?? "",
    grantProviderPocName: grantToEdit?.grantmaker_poc?.POC_name ?? "",
    grantProviderPocEmail: grantToEdit?.grantmaker_poc?.POC_email ?? "",
  });

  const validateInputs = (): string | null => {
    if (!form.organization.trim()) return "Organization Name is required";
    if (!form.applicationDate) return "Application Deadline is required";
    if (!form.grantStartDate) return "Grant Start Date is required";
    if (form.amount <= 0) return "Amount must be greater than 0";
    if (!form.status) return "Status is required";
    if (!form.bcanPocEmail) return "BCAN contact email required";
    return null;
  };

  const buttonOptions = [
    { id: "button1", label: "Active" },
    { id: "button2", label: "Pending" },
    { id: "button3", label: "Potential" },
    { id: "button4", label: "Rejected" },
    { id: "button5", label: "Inactive" },
  ];

  const buildGrant = (): Grant => ({
    grantId: grantToEdit?.grantId ?? 0,
    organization: form.organization,
    does_bcan_qualify: form.doesBcanQualify === "yes",
    amount: form.amount,
    grant_start_date: form.grantStartDate as TDateISO,
    application_deadline: form.applicationDate as TDateISO,
    status: form.status as Status,
    report_deadlines: form.reportDates as TDateISO[],
    timeline: form.timeline,
    estimated_completion_time: form.estimatedCompletionTime,
    description: form.description,
    attachments: form.attachments,
    isRestricted: form.isRestricted === "restricted",
    bcan_poc: {
      POC_name: form.bcanPocName,
      POC_email: form.bcanPocEmail,
    },
    grantmaker_poc: {
      POC_name: form.grantProviderPocName,
      POC_email: form.grantProviderPocEmail,
    },
  });

  const [_errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const error = validateInputs();

    if (error) {
      setErrorMessage(error);
      setShowErrorPopup(true);
      return;
    }

    const grantData = buildGrant();

    const result = grantToEdit
      ? await saveGrantEdits(grantData)
      : await createNewGrant(grantData);

    if (result.success) {
      setWasSubmitted(true);
      setSaving(false);
      onClose();
    } else {
      setErrorMessage(result.error ?? "An error occurred");
      setShowErrorPopup(true);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header with Buttons */}
          <div className="flex justify-between items-start mb-4">
            <div className="w-1/2 mr-4">
              <textarea
                className="block w-full text-gray-700 text-2xl border-2 bg-white border-grey-300 rounded placeholder:text-gray-700 p-3 font-bold min-h-[60px] resize-none"
                placeholder="Enter your Grant Name"
                value={form.organization}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                onChange={(e) => dispatch({type: "SET_FIELD",field:"organization",value: e.target.value})}
              />
            </div>
            <div className="flex space-x-4">
              <Button
                text="Cancel"
                className="border-2 border-grey-300"
                onClick={onClose}
              />
              <Button
                text="Save"
                className="bg-primary-900 text-gray-700 px-3 py-1"
                onClick={handleSubmit}
                disabled={saving}
              />
            </div>
          </div>

          {/* 5 Horizontal Buttons */}
          <div className="flex space-x-2 mt-4">
            {buttonOptions.map((btn) => (
              <Button
                key={btn.id}
                text={btn.label}
                className={`text-gray-700 px-3 py-1 text-sm border-2 ${status === btn.id ? "bg-primary-800 border-primary-800" : "border-grey-300"}`}
                onClick={() =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "status",
                    value: btn.id,
                  })
                }
              />
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-grey-300 my-6"></div>

          {/* Description */}
          <div className="w-1/2 mt-4">
            <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
              Description
            </label>
            <textarea
              className="h-48 block w-full text-gray-700 border bg-white border-grey-300 rounded placeholder:text-gray-700 p-2"
              placeholder="Enter Grant Description"
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
                  type="text"
                  className="appearance-none block w-full h-[36px] text-gray-700 placeholder:text-gray-700 border border-grey-300 rounded-md py-2 px-4"
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
                    className={`text-gray-700 px-3 py-1 text-sm border-2F ${form.doesBcanQualify === "yes" ? "bg-primary-800 border-primary-800" : "border-grey-300"}`}
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
                    className={`text-gray-700 px-3 py-1 text-sm border-2 ${form.doesBcanQualify === "no" ? "bg-primary-800 border-primary-800" : "border-grey-300"}`}
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
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-grey-300 my-4"></div>

          {/* Contacts and Documents Section */}
          <div className="flex space-x-4 items-start">
            {/* Left Column - Contacts and Documents */}
            <div className="w-1/2 pr-3">
              {/* Contacts */}
              <div className="w-1/2 mb-4">
                <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                  Contacts
                </label>
                <textarea
                  className="h-36 block w-full text-gray-700 border bg-white border-grey-300 rounded-md placeholder:text-gray-700 p-2"
                  placeholder="Enter Contacts"
                />
              </div>

              {/* Documents */}
              <div className="w-1/2">
                <label className="flex text-gray-700 sm:text-sm lg:text-base mb-1">
                  Documents
                </label>
                <Button
                  logo={faPlus}
                  logoPosition="left"
                  text="Add"
                  className="bg-white text-gray-700 border border-grey-300"
                  onClick={() => alert("Add document clicked")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 max-w-md mx-4 border-2 border-black">
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="mb-4">{_errorMessage}</p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="px-4 py-2 rounded hover:opacity-80 bg-primary-800 text-black border border-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default EditGrant;
