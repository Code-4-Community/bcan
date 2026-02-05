// frontend/src/grant-info/components/NewGrantModal.tsx
import React, { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import "../styles/NewGrantModal.css";
import { MdOutlinePerson2 } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { TDateISO } from "../../../../../backend/src/utils/date";
import { Status } from "../../../../../middle-layer/types/Status";
import {
  createNewGrant,
  saveGrantEdits,
} from "../new-grant/processGrantDataEditSave";
import { fetchGrants } from "../filter-bar/processGrantData";
import { observer } from "mobx-react-lite";
import  UserDropdown  from "./UserDropdown";

/** Attachment type from your middle layer */
enum AttachmentType {
  SCOPE_DOCUMENT = 0,
  SUPPORTING_RESOURCE = 1,
}

/** Attachment interface */
interface Attachment {
  attachment_name: string;
  url: string;
  type: AttachmentType;
}
// const FilterBar: React.FC = observer(() => {

const NewGrantModal: React.FC<{
  grantToEdit: Grant | null;
  onClose: () => void;
  isOpen: boolean;
}> = observer(({ grantToEdit, onClose, isOpen }) => {
  /*
      grantId: number;
      organization: string;
      does_bcan_qualify: boolean;
      status: Status;
      amount: number;
      grant_start_date: TDateISO; // when the grant was started
      application_deadline: TDateISO; // when was grant submission due
      report_deadlines: TDateISO[];       // multiple report dates
      description: string;
      timeline: number; // Need to specify
      estimated_completion_time: number,
      grantmaker_poc: POC; // person of contact at organization giving the grant
      // bcan_poc may need to be changed later to be a validated account
      bcan_poc: POC; // person of contact at BCAN
      attachments: Attachment[];
      restricted_or_unrestricted: string; // "restricted" or "unrestricted"
  */
  // Form fields, renamed to match your screenshot

  // Used
  const [organization, _setOrganization] = useState<string>(
    grantToEdit ? grantToEdit.organization : ""
  );

  // Helper function to normalize dates to YYYY-MM-DD format
  const normalizeDateToISO = (date: TDateISO | ""): TDateISO | "" => {
    if (!date) return "";
    // If it has time component, extract just the date part
    return date.split("T")[0] as TDateISO;
  };

  // Used
  const [applicationDate, _setApplicationDate] = useState<TDateISO | "">(
    grantToEdit?.application_deadline
      ? normalizeDateToISO(grantToEdit.application_deadline)
      : ""
  );

  const [grantStartDate, _setGrantStartDate] = useState<TDateISO | "">(
    grantToEdit?.grant_start_date
      ? normalizeDateToISO(grantToEdit.grant_start_date)
      : ""
  );

  const [reportDates, setReportDates] = useState<(TDateISO | "")[]>(
    grantToEdit?.report_deadlines?.map((date) => normalizeDateToISO(date)) || []
  );

  // Used
  const [timelineInYears, _setTimelineInYears] = useState<number>(
    grantToEdit ? grantToEdit.timeline : 1
  );

  // Used
  const [estimatedCompletionTimeInHours, _setEstimatedCompletionTimeInHours] =
    useState<number>(grantToEdit ? grantToEdit.estimated_completion_time : 10);

  // Used
  const [doesBcanQualify, _setDoesBcanQualify] = useState<string>(
    grantToEdit ? (grantToEdit.does_bcan_qualify ? "yes" : "no") : ""
  );

  // Used
  const [isRestricted, _setIsRestricted] = useState<string>(
    grantToEdit ? String(grantToEdit.isRestricted) : ""
  );

  // Used
  const [status, _setStatus] = useState<Status | string>(
    grantToEdit ? grantToEdit.status : ""
  );

  // Used
  const [amount, _setAmount] = useState<number>(
    grantToEdit ? grantToEdit.amount : 1000
  );
  // Used
  const [description, _setDescription] = useState<string>(
    grantToEdit ? (grantToEdit.description ? grantToEdit.description : "") : ""
  );

  // Attachments array
  // Used
  const [attachments, setAttachments] = useState<Attachment[]>(
    grantToEdit?.attachments || []
  );
  // Used
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState<Attachment>({
    attachment_name: "",
    url: "",
    type: AttachmentType.SCOPE_DOCUMENT,
  });

  // Used
  const [bcanPocName, setBcanPocName] = useState(
    grantToEdit
      ? grantToEdit.bcan_poc
        ? grantToEdit.bcan_poc.POC_name
        : ""
      : ""
  );
  // Used?
  const [bcanPocEmail, setBcanPocEmail] = useState(
    grantToEdit
      ? grantToEdit.bcan_poc
        ? grantToEdit.bcan_poc.POC_email
        : ""
      : ""
  );
  // Used
  const [grantProviderPocName, setGrantProviderPocName] = useState(
    grantToEdit
      ? grantToEdit.grantmaker_poc
        ? grantToEdit.grantmaker_poc.POC_name
        : ""
      : ""
  );
  // Used
  const [grantProviderPocEmail, setGrantProviderPocEmail] = useState(
    grantToEdit
      ? grantToEdit.grantmaker_poc
        ? grantToEdit.grantmaker_poc.POC_email
        : ""
      : ""
  );

  // For error handling
  // @ts-ignore
  const [_errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // State to track if form was submitted successfully
  const [wasSubmitted, setWasSubmitted] = useState(false);

  // Add the useEffect
  useEffect(() => {
    if (!isOpen && wasSubmitted) {
      fetchGrants();
      setWasSubmitted(false); // Reset for next time
    }
  }, [isOpen, wasSubmitted]);

  /* Add a new blank report date to the list */
  // Used
  const _addReportDate = () => {
    setReportDates([...reportDates, ""]);
  };

  // Used
  const _removeReportDate = (index: number) => {
    const updated = [...reportDates];
    updated.splice(index, 1);
    setReportDates(updated);
  };

  // Used
  const _addAttachment = () => {
    setIsAddingAttachment(true);
    // Validate fields are not empty
    if (!currentAttachment.attachment_name || !currentAttachment.url) {
      // Optional: show error message
      return;
    }

    // Add the current attachment to the list
    setAttachments([...attachments, currentAttachment]);

    // Clear the input fields
    setCurrentAttachment({
      attachment_name: "",
      url: "",
      type: AttachmentType.SCOPE_DOCUMENT,
    });
  };

  // Used
  const _removeAttachment = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    if (updated.length === 0) {
      setIsAddingAttachment(false);
    }
  };

  /** Basic validations based on your screenshot fields */
  const validateInputs = (): boolean => {
    // Timeline check


    // Organization validation
    if (!organization || organization.trim() === "") {
      setErrorMessage("Organization Name is required.");
      return false;
    }
    // Does BCAN Qualify validation
    if (doesBcanQualify === "") {
      setErrorMessage("Set Does BCAN Qualify? to 'yes' or 'no'");
      return false;
    }
    // Status validation
    if (status === "" || status == null) {
      setErrorMessage("Status is required.");
      return false;
    }
    const validStatuses = [
      Status.Active,
      Status.Inactive,
      Status.Potential,
      Status.Pending,
      Status.Rejected,
    ];
    if (!validStatuses.includes(status as Status)) {
      setErrorMessage("Invalid status selected.");
      return false;
    }
    // Amount validation
    if (amount <= 0) {
      setErrorMessage("Amount must be greater than 0.");
      return false;
    }
    if (isNaN(amount) || !isFinite(amount)) {
      setErrorMessage("Amount must be a valid number.");
      return false;
    }
    // Date validations
    if (!applicationDate || applicationDate.trim() === "") {
      setErrorMessage("Application Deadline is required.");
      return false;
    }
    if (!grantStartDate || grantStartDate.trim() === "") {
      setErrorMessage("Grant Start Date is required.");
      return false;
    }

    // const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    // if (!isoDateRegex.test(applicationDate)) {
    //   setErrorMessage("Application Deadline must be in valid date format (YYYY-MM-DD). instead of " + applicationDate);
    //   return false;
    // }
    // if (!isoDateRegex.test(grantStartDate)) {
    //   setErrorMessage("Grant Start Date must be in valid date format (YYYY-MM-DD).");
    //   return false;
    // }
    // Validate dates are actual valid dates
    const appDate = new Date(applicationDate);
    const startDate = new Date(grantStartDate);
    if (isNaN(appDate.getTime())) {
      setErrorMessage("Application Deadline is not a valid date.");
      return false;
    }
    if (isNaN(startDate.getTime())) {
      setErrorMessage("Grant Start Date is not a valid date.");
      return false;
    }
    // Logical date validation - grant start should typically be after application deadline
    if (startDate < appDate) {
      setErrorMessage(
        "Grant Start Date should typically be after Application Deadline."
      );
      return false;
    }

    // Report deadlines validation
    if (reportDates && reportDates.length > 0) {
      for (let i = 0; i < reportDates.length; i++) {
        const reportDate = reportDates[i];

        // Skip empty entries (if you allow them)
        if (!reportDate) {
          setErrorMessage(
            `Report Date ${i + 1} cannot be empty. Remove it if not needed.`
          );
          return false;
        }

        const repDate = new Date(reportDate);
        if (isNaN(repDate.getTime())) {
          setErrorMessage(`Report Date ${i + 1} is not a valid date.`);
          return false;
        }
      }
    }
    // Timeline validation
    if (timelineInYears < 0) {
      setErrorMessage("Timeline cannot be negative.");
      return false;
    }
    // Estimated completion time validation
    if (estimatedCompletionTimeInHours <= 0) {
      setErrorMessage("Estimated Completion Time cannot be negative.");
      return false;
    }
    if (estimatedCompletionTimeInHours <= 0) {
      setErrorMessage("Estimated Completion Time must be greater than 0.");
      return false;
    }
    // Restriction type validation
    if (isRestricted === "") {
      setErrorMessage("Set Restriction Type to 'restricted' or 'unrestricted'");
      return false;
    }
    // BCAN POC validation
    if (!bcanPocName || bcanPocName.trim() === "") {
      setErrorMessage("BCAN Point of Contact Name is required.");
      return false;
    }
    if (!bcanPocEmail || bcanPocEmail.trim() === "") {
      setErrorMessage("BCAN Point of Contact Email is required.");
      return false;
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bcanPocEmail)) {
      setErrorMessage(
        "BCAN Point of Contact Email must be a valid email address."
      );
      return false;
    }
    // Grant Provider POC validation (optional, but if provided must be valid)
    if (grantProviderPocName && grantProviderPocName.trim() !== "") {
      if (grantProviderPocName.trim().length < 2) {
        setErrorMessage(
          "Grant Provider Point of Contact Name must be at least 2 characters."
        );
        return false;
      }
    }
    if (grantProviderPocEmail && grantProviderPocEmail.trim() !== "") {
      if (!emailRegex.test(grantProviderPocEmail)) {
        setErrorMessage(
          "Grant Provider Point of Contact Email must be a valid email address."
        );
        return false;
      }
    }
    // Attachments validation
    if (attachments && attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        if (
          !attachment.attachment_name ||
          attachment.attachment_name.trim() === ""
        ) {
          setErrorMessage(`Attachment ${i + 1} must have a name.`);
          return false;
        }
        if (!attachment.url || attachment.url.trim() === "") {
          setErrorMessage(`Attachment ${i + 1} must have a URL.`);
          return false;
        }
        // Basic URL validation
        try {
          new URL(attachment.url);
        } catch {
          setErrorMessage(`Attachment ${i + 1} URL is not valid.`);
          return false;
        }
      }
    }
    // Description validation (optional but reasonable length if provided)
    if (description && description.length > 5000) {
      setErrorMessage("Description is too long (max 5000 characters).");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      setShowErrorPopup(true);
      return;
    }

    const grantData: Grant = {
      grantId: grantToEdit ? grantToEdit.grantId : 0,
      organization: organization,
      does_bcan_qualify: doesBcanQualify === "yes",
      amount,
      grant_start_date: grantStartDate as TDateISO,
      application_deadline: applicationDate as TDateISO,
      status: status as Status,
      bcan_poc: { POC_name: bcanPocName, POC_email: bcanPocEmail },
      grantmaker_poc:
        grantProviderPocName && grantProviderPocEmail
          ? { POC_name: grantProviderPocName, POC_email: grantProviderPocEmail }
          : { POC_name: "", POC_email: "" },
      report_deadlines: reportDates as TDateISO[],
      timeline: timelineInYears,
      estimated_completion_time: estimatedCompletionTimeInHours,
      description: description ? description : "",
      attachments: attachments,
      isRestricted: isRestricted === "restricted",
    };

    const result = grantToEdit
      ? await saveGrantEdits(grantData)
      : await createNewGrant(grantData);

    if (result.success) {
      console.log("Handle submit success in NewGrantModal");
      setWasSubmitted(true);
      isOpen = false;
      onClose();
      //await fetchGrants(); // ← Call it here instead
    } else {
      setErrorMessage(result.error || "An error occurred");
      setShowErrorPopup(true);
    }
    // onClose();
  };

  return (
    <div className="modal-overlay">
      {" "}
      {/*Greyed out background */}
      <div className="modal-content ">
        {" "}
        {/*Popup container */}
        <h2 className="font-family-helvetica">New Grant</h2>
        <div className="flex">
          {" "}
          {/* Major components in two columns */}
          {/*left column */}
          <div className="w-1/2  pr-5">
            {/*Organization name and input */}
            <div className="w-full md:mb-0">
              <label
                className="font-family-helvetica  sm:text-sm lg:text-base flex block text-black  mb-1"
                htmlFor="grid-first-name"
              >
                Organization Name *
              </label>
              <input
                className="font-family-helvetica block w-full h-[42px] bg-tan text-black placeholder:text-gray-400 border border-black rounded py-3 px-4 mb-3 leading-tight"
                id="grid-first-name"
                type="text"
                placeholder="Type Here"
                value={organization}
                onChange={(e) => _setOrganization(e.target.value)}
              />
            </div>

            {/*Top left quadrant - from app date, start date, report deadlines, est completion time*/}
            <div className="flex  w-full space-x-4 mt-5 ">
              {/* Left column: Application + Grant Start row */}
              <div className="w-[55%]">
                {/*Application date and grant start date */}
                <div className="flex space-x-4">
                  {/*Application date and input */}
                  <div className="w-1/2">
                    <label
                      className="font-family-helvetica flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1"
                      htmlFor="grid-city"
                    >
                      Application Date *
                    </label>
                    <input
                      className={`font-family-helvetica appearance-none block w-full h-[42px] bg-tan border border-black rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${
                        applicationDate ? "text-black" : "text-gray-500"
                      }`}
                      id="grid-city"
                      type="date"
                      value={
                        applicationDate ? applicationDate.split("T")[0] : ""
                      }
                      onChange={(e) =>
                        _setApplicationDate(e.target.value as TDateISO)
                      }
                    />
                  </div>
                  {/*Grant Start Date and input */}
                  <div className=" w-1/2">
                    <label
                      className="font-family-helvetica flex block tracking-wide text-black text-black  sm:text-sm lg:text-base mb-1"
                      htmlFor="grid-state"
                    >
                      Grant Start Date *
                    </label>
                    <input
                      className={`font-family-helvetica w-full appearance-none block w-full h-[42px] bg-tan placeholder:text-gray-400 border border-black rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 ${
                        grantStartDate ? "text-black" : "text-gray-500"
                      }`}
                      id="grid-city"
                      type="date"
                      value={grantStartDate ? grantStartDate.split("T")[0] : ""}
                      onChange={(e) =>
                        _setGrantStartDate(e.target.value as TDateISO)
                      }
                    />
                  </div>
                </div>

                {/*Estimated completition time and input - need to make wider (length of application date and grant start date)*/}
                <div className="w-full mt-11">
                  <label
                    className="font-family-helvetica flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1"
                    htmlFor="grid-state"
                  >
                    Estimated Completion Time (in hours) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="font-family-helvetica appearance-none block w-full h-[42px] bg-tan text-black placeholder:text-gray-400 border border-black rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="grid-city"
                    value={estimatedCompletionTimeInHours}
                    onChange={(e) =>
                      _setEstimatedCompletionTimeInHours(Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {/*Right column*/}
              <div className="w-[45%] sm:pl-4 lg:pl-4">
                {/*Report deadlines label and grey box */}
                <div className="h-full">
                  <label
                    className="font-family-helvetica flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1"
                    htmlFor="grid-zip"
                  >
                    Report Deadlines
                  </label>
                  <div
                    className="p-2 rounded-[1.2rem] sm:h-52 xl:h-40 overflow-y-auto overflow-x-hidden bg-grey-400 border border-black"
                  >
                    <button
                      className="font-family-helvetica w-full h-[42px] text-xs mb-2 flex items-center justify-center bg-primary-800 hover:bg-primary-900 text-black border border-black"
                      onClick={_addReportDate}
                    >
                      Add Deadline +
                    </button>
                    {reportDates.map((date, index) => (
                      <div key={index} className="flex gap-2 mb-2 w-full">
                        <input
                          key={index}
                          className="font-family-helvetica flex-1 min-w-0 h-[42px] bg-tan text-black rounded border border-black"
                          type="date"
                          value={
                            date
                              ? date.includes("T")
                                ? date.split("T")[0]
                                : date
                              : ""
                          }
                          onChange={(e) => {
                            const newDates = [...reportDates];
                            newDates[index] = e.target.value as TDateISO | "";
                            setReportDates(newDates);
                          }}
                        />
                        {reportDates.length > 0 && (
                          <button
                            className="font-family-helvetica w-5 h-[42px] flex-shrink-0 rounded text-white font-bold flex items-center justify-center bg-red-light border border-black"
                            onClick={() => _removeReportDate(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between mt-4 h-[160px]">
              {/*Timeline label and input */}
              <div className="w-full">
                <label
                  className="font-family-helvetica flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1"
                  htmlFor="grid-first-name"
                >
                  Timeline (in years) *
                </label>
                <input
                  className="font-family-helvetica appearance-none block w-full h-[42px] bg-tan text-black placeholder:text-gray-400 border border-black rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                  type="number"
                  min="0"
                  placeholder="Type Here"
                  value={timelineInYears}
                  onChange={(e) => _setTimelineInYears(Number(e.target.value))}
                />
              </div>

              {/*Amount label and input */}
              <div className="w-full ">
                <label
                  className="font-family-helvetica flex block tracking-wide text-black placeholder:text-gray-400  sm:text-sm lg:text-base mb-1"
                  htmlFor="grid-first-name"
                >
                  Amount (in $) *
                </label>
                <CurrencyInput
                  className="font-family-helvetica appearance-none block w-full h-[42px] mb-[2px] bg-tan text-gray-700 border border-black rounded px-4 leading-tight focus:outline-none focus:bg-white"
                  min={0}
                  decimalsLimit={2}
                  placeholder="Type Here"
                  value={amount}
                  onValueChange={(value) => _setAmount(Number(value))}
                />
              </div>
            </div>
          </div>
          {/*Right column */}
          <div className="w-1/2 pl-5">
            {/*POC row */}
            <div className="flex w-full mb-16">
              {/*BCAN POC div*/}
              <div className="w-full pr-3">
                  <label className="font-family-helvetica mb-1 flex block tracking-wide text-black text-lg" htmlFor="grid-zip">
                      BCAN POC *
                  </label>
                  {/*Box div*/} 
                  <div className="items-center flex p-3 rounded-[1.2rem] h-full bg-primary-800 border border-black">
                      <MdOutlinePerson2 className="w-1/4 h-full p-1"/>
                      <div className="w-3/4">
                      <UserDropdown
                      selectedUser={bcanPocName && bcanPocEmail ? {name: bcanPocName, email: bcanPocEmail } : null}
                      onSelect={(user) => {
                        setBcanPocName(user.name);
                        setBcanPocEmail(user.email)
                      }}
                      placeholder="Name"
                      />
                        <input className="font-family-helvetica w-full h-[48px] bg-tan text-gray-700 rounded border border-black"
                         placeholder="e-mail" 
                         value={bcanPocEmail}
                         readOnly
                         />
                      </div> 
                  </div>
                </div>

              {/*Grant Provider POC div*/}
              <div className="w-full pl-3">
                <label
                  className="font-family-helvetica mb-1 flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1 text-left"
                  htmlFor="grid-zip"
                >
                  Grant Provider POC
                </label>
                {/*Box div*/}
                <div
                  className="flex p-3 rounded-[1.2rem] items-center h-full bg-primary-800 border border-black"
                >
                  <MdOutlinePerson2 className="sm:p-1 lg:p-2 w-1/4 h-full" />
                  <div className="w-3/4">
                    <input
                      className="font-family-helvetica w-full h-[42px] bg-tan text-gray-700 rounded border border-black"
                      id="grid-city"
                      placeholder="Name"
                      value={grantProviderPocName}
                      onChange={(e) => setGrantProviderPocName(e.target.value)}
                    />
                    <input
                      className="font-family-helvetica w-full h-[42px] bg-tan text-gray-700 rounded border border-black"
                      id="grid-city"
                      placeholder="e-mail"
                      value={grantProviderPocEmail}
                      onChange={(e) => setGrantProviderPocEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/*bottom  right row*/}
            <div className="flex w-full">
              {/* Select option menus */}
              <div className="w-1/2 flex flex-col pr-3 justify-between">
                {/*Qualify label and input */}
                <div className="w-full ">
                  <label
                    className="font-family-helvetica flex block tracking-wide text-black sm:text-sm lg:text-base mb-1 text-left"
                    htmlFor="grid-first-name"
                  >
                    Does BCAN qualify? *
                  </label>
                  <select
                    className={`font-family-helvetica appearance-none block w-full h-[42px] bg-tan border border-black rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white ${
                      doesBcanQualify == "" ? "text-gray-500" : "text-black"
                    }`}
                    id="grid-first-name"
                    value={doesBcanQualify}
                    onChange={(e) => _setDoesBcanQualify(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/*Status label and input */}
                <div className="w-full">
                  <label
                    className="font-family-helvetica flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1"
                    htmlFor="grid-first-name"
                  >
                    Status
                  </label>
                  <select
                    className={`font-family-helvetica appearance-none block w-full h-[42px] bg-tan placeholder:text-gray-400 border border-black rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white ${
                      status == null ? "text-gray-500" : "text-black"
                    }`}
                    id="grid-first-name"
                    value={status}
                    onChange={(e) => _setStatus(e.target.value as Status)}
                  >
                    <option value="">Select...</option>
                    <option value="Potential">Potential</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/*Restriction types label and input */}
                <div className="w-full">
                  <label
                    className="font-family-helvetica flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1 text0left"
                    htmlFor="grid-first-name"
                  >
                    Restriction type *
                  </label>
                  <select
                    className={`font-family-helvetica appearance-none block w-full h-[42px] bg-tan border border-black rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white ${
                      isRestricted == "" ? "text-gray-500" : "text-black"
                    }`}
                    id="grid-first-name"
                    value={isRestricted}
                    onChange={(e) => _setIsRestricted(e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option style={{ color: "black" }} value="unrestricted">
                      Unrestricted
                    </option>
                    <option style={{ color: "black" }} value="restricted">
                      Restricted
                    </option>
                  </select>
                </div>
              </div>

              {/*Scope Documents div p-2 h-full w-1/2 flex-col*/}
              <div className="w-1/2 flex-col pl-3">
                <label className="font-family-helvetica flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1 text-start">
                  Scope Documents
                </label>

                {/* Upload button */}
                {!isAddingAttachment && (
                  <button
                    type="button"
                    onClick={_addAttachment}
                    className="items-center flex font-family-helvetica w-full h-[42px] mt-1 mb-2 justify-center  bg-primary-800 hover:bg-primary-900 text-black border border-black"
                  >
                    <FiUpload className="mr-2" />
                    <span>Upload Documents</span>
                  </button>
                )}

                {/* Editable attachment rows */}
                {isAddingAttachment && (
                  <div className="  mt-1 mb-2">
                    <div className="gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Name"
                        className="flex-1 px-2 h-[42px] bg-tan border border-black rounded-md"
                        value={currentAttachment.attachment_name}
                        onChange={(e) =>
                          setCurrentAttachment({
                            ...currentAttachment,
                            attachment_name: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="URL"
                        className="flex-1 px-2 h-[42px] bg-tan border border-black rounded-md"
                        value={currentAttachment.url}
                        onChange={(e) =>
                          setCurrentAttachment({
                            ...currentAttachment,
                            url: e.target.value,
                          })
                        }
                      />
                      <select
                        className="h-[42px] bg-tan border border-black rounded-md px-2 items-center justify-center"
                        value={currentAttachment.type}
                        onChange={(e) =>
                          setCurrentAttachment({
                            ...currentAttachment,
                            type: Number(e.target.value) as AttachmentType,
                          })
                        }
                      >
                        <option value={AttachmentType.SCOPE_DOCUMENT}>
                          Scope
                        </option>
                        <option value={AttachmentType.SUPPORTING_RESOURCE}>
                          Supporting
                        </option>
                      </select>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="mr-2 h-[21px] bg-grey-400 text-black border border-black rounded-md flex items-center justify-center"
                          onClick={() => setIsAddingAttachment(false)}
                        >
                          Close
                        </button>

                        <button
                          type="button"
                          onClick={_addAttachment}
                          className="h-[21px] bg-primary-800 text-black border border-black rounded-md flex items-center justify-center"
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gray box showing added links */}
                <div
                  className={`p-2 rounded-md overflow-y-auto overflow-x-hidden bg-grey-400 border border-black ${
                    isAddingAttachment ? "h-[77px]" : "h-[168px]"
                  }`}
                >
                  {attachments
                    .filter((a) => a.url) // show only filled ones
                    .map((attachment, index) => (
                      <div
                        key={index}
                        className="flex gap-2 mb-2 w-full items-center"
                      >
                        <div
                          className="overflow-hidden rounded-md font-family-helvetica flex-1 min-w-0 h-[42px] bg-tan text-gray-700 border border-black flex items-center px-3 justify-between"
                        >
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline truncate"
                          >
                            {attachment.attachment_name || "Untitled"}
                          </a>
                          <span className="ml-2 text-xs text-gray-600">
                            (
                            {attachment.type === AttachmentType.SCOPE_DOCUMENT
                              ? "Scope"
                              : "Supporting"}
                            )
                          </span>
                        </div>
                        <button
                          className="font-family-helvetica w-5 h-[42px] flex-shrink-0 rounded text-white font-bold flex items-center justify-center bg-red-light border border-black"
                          onClick={() => _removeAttachment(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              </div>
              {/*End bottom right row */}
            </div>
            {/*End right column */}
          </div>
          {/*End grid content*/}
        </div>
        {/*Description and input */}
        <div className="w-full mt-4">
          <label
            className="font-family-helvetica flex block tracking-wide text-black  sm:text-sm lg:text-base mb-1"
            htmlFor="grid-first-name"
          >
            Description
          </label>
          <textarea
            className="font-family-helvetica h-48 block w-full bg-tan text-gray-700 border border-black rounded py-3 px-4 mb-3 leading-tight"
            id="grid-first-name"
            value={description}
            onChange={(e) => _setDescription(e.target.value)}
          />
        </div>
        <div className="button-row">
          <button
            className="font-family-helvetica h-[42px] flex items-center justify-center text-black bg-white border border-black"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="font-family-helvetica h-[42px] flex items-center justify-center text-black bg-primary-800 border border-black"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
        {/*End modal content */}
      </div>
      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg p-6 max-w-md mx-4 border-2 border-black"
          >
            <h3 className="font-family-helvetica text-xl font-bold mb-2">
              Error
            </h3>
            <p className="font-family-helvetica mb-4">{_errorMessage}</p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="font-family-helvetica px-4 py-2 rounded hover:opacity-80 bg-primary-800 text-black border border-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/*End modal overlay */}
    </div>
  );
});

export default NewGrantModal;
