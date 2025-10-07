// frontend/src/grant-info/components/NewGrantModal.tsx
import React, { useState, createRef, RefObject } from "react";
import { fetchAllGrants } from "../../../external/bcanSatchel/actions";
import "../styles/NewGrantModal.css";
import POCEntry from "./POCEntry";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { TDateISO } from "../../../../../backend/src/utils/date";
import { Status } from "../../../../../middle-layer/types/Status";
import { api } from "../../../api";

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

/** POC ref type from POCEntry */
export interface POCEntryRef {
  getPOC: () => string;
}

const NewGrantModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
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
  const [organization, setOrganization] = useState<string>("");
  const [bcanPocComponents, setBcanPocComponents] = useState<JSX.Element[]>([]);
  const [bcanPocRefs, setBcanPocRefs] = useState<RefObject<POCEntryRef>[]>([]);

  const [grantProviderPocComponents, setGrantProviderPocComponents] = useState<JSX.Element[]>([]);
  const [grantProviderPocRefs, setGrantProviderPocRefs] = useState<RefObject<POCEntryRef>[]>([]);

  const [applicationDate, setApplicationDate] = useState<string>("");
  const [grantStartDate, setGrantStartDate] = useState<string>("");
  const [reportDates, setReportDates] = useState<string[]>([]);

  const [timelineInYears, setTimelineInYears] = useState<number>(0);
  const [estimatedCompletionTimeInHours, setEstimatedCompletionTimeInHours] = useState<number>(0);

  const [doesBcanQualify, setDoesBcanQualify] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>(Status.Potential);

  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");

  // Attachments array
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // For error handling
  const [errorMessage, setErrorMessage] = useState<string>("");

  /** Add a new BCAN POC entry */
  const addBcanPoc = () => {
    const newRef = createRef<POCEntryRef>();
    const newPOC = <POCEntry ref={newRef} key={`bcan-${bcanPocComponents.length}`} />;
    setBcanPocComponents([...bcanPocComponents, newPOC]);
    setBcanPocRefs([...bcanPocRefs, newRef]);
  };

  /** Add a new Grant Provider POC entry */
  const addGrantProviderPoc = () => {
    const newRef = createRef<POCEntryRef>();
    const newPOC = <POCEntry ref={newRef} key={`provider-${grantProviderPocComponents.length}`} />;
    setGrantProviderPocComponents([...grantProviderPocComponents, newPOC]);
    setGrantProviderPocRefs([...grantProviderPocRefs, newRef]);
  };

  /* Add a new blank report date to the list */
  const addReportDate = () => {
    setReportDates([...reportDates, ""]);
  };0

  // Add an empty attachment row
  const addAttachment = () => {
    setAttachments([
      ...attachments,
      {
        attachment_name: "",
        url: "",
        type: AttachmentType.SCOPE_DOCUMENT,
      },
    ]);
  };

  // Remove a specific attachment row
  const removeAttachment = (index: number) => {
    const updated = [...attachments];
    updated.splice(index, 1);
    setAttachments(updated);
  };

  // Update a field in one attachment
  const handleAttachmentChange = (
    index: number,
    field: keyof Attachment,
    value: string | AttachmentType
  ) => {
    const updated = [...attachments];
    // @ts-ignore
    updated[index][field] = value;
    setAttachments(updated);
  };

  const removeReportDate = (index: number) => {
    const updated = [...reportDates];
    updated.splice(index, 1);
    setReportDates(updated);
  };
  const handleReportDateChange = (index: number, value: string) => {
    const updated = [...reportDates];
    updated[index] = value;
    setReportDates(updated);
  };

  /** Basic validations based on your screenshot fields */
  const validateInputs = (): boolean => {
    if (!organization) {
      setErrorMessage("Organization Name is required.");
      return false;
    }
    // removed check for report dates -- they can be empty (potential grants would have no report dates)
    if (!applicationDate || !grantStartDate) {
      setErrorMessage("Please fill out all date fields.");
      return false;
    }
    if (amount <= 0) {
      setErrorMessage("Amount must be greater than 0.");
      return false;
    }
    return true;
  };

  /** On submit, POST the new grant, then re-fetch from the backend */
  const handleSubmit = async () => {
    if (!validateInputs()) return;

    // Gather BCAN POC values
    const bcanPocList: string[] = [];
    bcanPocRefs.forEach((ref) => {
      if (ref.current) {
        bcanPocList.push(ref.current.getPOC());
      }
    });

    // Gather Grant Provider POC values
    const providerPocList: string[] = [];
    grantProviderPocRefs.forEach((ref) => {
      if (ref.current) {
        providerPocList.push(ref.current.getPOC());
      }
    });

    // Convert attachments array
    const attachmentsArray = attachments.map((att) => ({
      attachment_name: att.attachment_name.trim(),
      url: att.url.trim(),
      type: att.type,
    }));

    /* Matches middle layer definition */
    const newGrant: Grant = {
      grantId: -1,
      organization,
      does_bcan_qualify: doesBcanQualify,
      amount,
      grant_start_date: grantStartDate as TDateISO,
      application_deadline: applicationDate as TDateISO,
      status: status, // Potential = 0, Active = 1, Inactive = 2
      bcan_poc: bcanPocList.length > 0 ? { POC_name: "", POC_email: bcanPocList[0] } : { POC_name: "", POC_email: ""}, // Just take the first for now
      grantmaker_poc: providerPocList.length > 0 ? { POC_name: "", POC_email: providerPocList[0] } : { POC_name: "", POC_email: ""}, // Just take the first for now
      report_deadlines: reportDates as TDateISO[],
      timeline: timelineInYears,
      estimated_completion_time: estimatedCompletionTimeInHours,
      description,
      attachments: attachmentsArray,
      isRestricted: false, // Default to unrestricted for now
    };
    console.log(newGrant);
    try {
      const response = await api("/grant/new-grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGrant),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.errMessage || "Failed to add grant.");
        return;
      }

      // Re-fetch the full list of grants
      const grantsResponse = await api("/grant");
      if (!grantsResponse.ok) {
        throw new Error("Failed to re-fetch grants.");
      }
      const updatedGrants = await grantsResponse.json();
      // Update the store
      fetchAllGrants(updatedGrants);

      onClose();
    } catch (error) {
      setErrorMessage("Server error. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content new-grant-grid">
        <h2>Add New Grant</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {/* Row 1 */}
        <label className="label-col">Organization Name</label>
        <input
          className="input-col"
          type="text"
          placeholder="Click to edit name"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />

        <label className="label-col">BCAN POC</label>
        <div className="poc-box">
          {bcanPocComponents}
          <button onClick={addBcanPoc}>+ Add BCAN POC</button>
        </div>

        <label className="label-col">Grant Provider POC</label>
        <div className="poc-box">
          {grantProviderPocComponents}
          <button onClick={addGrantProviderPoc}>+ Add Provider POC</button>
        </div>

        {/* Row 2: Dates */}
        <label className="label-col">Application Date</label>
        <input
          className="input-col"
          type="date"
          value={applicationDate}
          onChange={(e) => setApplicationDate(e.target.value)}
        />

        <label className="label-col">Grant Start Date</label>
        <input
          className="input-col"
          type="date"
          value={grantStartDate}
          onChange={(e) => setGrantStartDate(e.target.value)}
        />

        <label className="label-col">Report Dates</label>
        <div className="input-col report-dates-container">
          {reportDates.map((d, idx) => (
            <div className="report-date-entry" key={idx}>
              <input
                type="date"
                value={d}
                onChange={(e) => handleReportDateChange(idx, e.target.value)}
             />
              <button type="button" onClick={() => removeReportDate(idx)}>
                X
              </button>
            </div>
          ))}
          <button type="button" onClick={addReportDate}>
            + Add Report Date
          </button>
        </div>

        {/* Row 3: Times */}
        <label className="label-col">Estimated Completion Time (in hours)</label>
        <input
          className="input-col"
          type="number"
          value={estimatedCompletionTimeInHours}
          onChange={(e) => setEstimatedCompletionTimeInHours(Number(e.target.value))}
        />

        <label className="label-col">Timeline (in years)</label>
        <input
          className="input-col"
          type="number"
          value={timelineInYears}
          onChange={(e) => setTimelineInYears(Number(e.target.value))}
        />

        {/* Row 4: Does BCAN Qualify & Status */}
        <label className="label-col">Does BCAN Qualify?</label>
        <select
          className="input-col"
          value={doesBcanQualify ? "true" : "false"}
          onChange={(e) => setDoesBcanQualify(e.target.value === "true")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label className="label-col">Status</label>
        <select
          className="input-col"
          value={status}
          onChange={(e) => setStatus((e.target.value) as Status)}
        >
          <option value={Status.Active}>Active</option>
          <option value={Status.Inactive}>Inactive</option>
          <option value={Status.Potential}>Potential</option>
          <option value={Status.Pending}>Pending</option>
          <option value={Status.Rejected}>Rejected</option>
        </select>

        {/* Row 5: Amount */}
        <label className="label-col">Amount</label>
        <input
          className="input-col"
          type="number"
          placeholder="$0.00"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        {/* Row 6: Scope Documents (Attachments) */}
        <label className="label-col">Scope Documents</label>
        <div className="attachments-container input-col">
          {attachments.map((attachment, index) => (
            <div className="attachment-entry" key={index}>
              <input
                type="text"
                placeholder="Attachment Name"
                value={attachment.attachment_name}
                onChange={(e) =>
                  handleAttachmentChange(index, "attachment_name", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="URL"
                value={attachment.url}
                onChange={(e) =>
                  handleAttachmentChange(index, "url", e.target.value)
                }
              />
              <select
                value={attachment.type}
                onChange={(e) =>
                  handleAttachmentChange(index, "type", Number(e.target.value))
                }
              >
                <option value={AttachmentType.SCOPE_DOCUMENT}>Scope Document</option>
                <option value={AttachmentType.SUPPORTING_RESOURCE}>Supporting Resource</option>
              </select>
              <button onClick={() => removeAttachment(index)}>X</button>
            </div>
          ))}
          <button onClick={addAttachment}>Choose Files</button>
        </div>

        {/* Row 7: Description */}
        <label className="label-col">Description</label>
        <textarea
          className="input-col"
          placeholder="Type Grant Descriptions, Application Requirements, and General Notes here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* Row 8: Buttons */}
        <div className="button-row">
          <button onClick={onClose}>Close</button>
          <button onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default NewGrantModal;
