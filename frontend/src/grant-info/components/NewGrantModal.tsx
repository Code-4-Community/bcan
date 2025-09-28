// frontend/src/grant-info/components/NewGrantModal.tsx
import React, { useState, createRef, RefObject } from "react";
import { fetchAllGrants } from "../../external/bcanSatchel/actions";
import "../components/styles/NewGrantModal.css";
import POCEntry from "./POCEntry";
import { Grant } from "../../../../middle-layer/types/Grant";
import { TDateISO } from "../../../../backend/src/utils/date";
import { Status } from "../../../../middle-layer/types/Status";
import { api } from "../../api";

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
  // Form fields, renamed to match your screenshot
  const [organization, setOrganization] = useState<string>("");
  const [bcanPocComponents, setBcanPocComponents] = useState<JSX.Element[]>([]);
  const [bcanPocRefs, setBcanPocRefs] = useState<RefObject<POCEntryRef>[]>([]);

  const [grantProviderPocComponents, setGrantProviderPocComponents] = useState<JSX.Element[]>([]);
  const [grantProviderPocRefs, setGrantProviderPocRefs] = useState<RefObject<POCEntryRef>[]>([]);

  const [applicationDate, setApplicationDate] = useState<string>("");
  const [grantStartDate, setGrantStartDate] = useState<string>("");
  const [reportDate, setReportDate] = useState<string>("");

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

  /** Basic validations based on your screenshot fields */
  const validateInputs = (): boolean => {
    if (!organization) {
      setErrorMessage("Organization Name is required.");
      return false;
    }
    if (!applicationDate || !grantStartDate || !reportDate) {
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
      grantmaker_poc: providerPocList,
      application_deadline: applicationDate as TDateISO,
      report_deadline: reportDate as TDateISO,
      timeline: timelineInYears,
      estimated_completion_time: estimatedCompletionTimeInHours,
      does_bcan_qualify: doesBcanQualify,
      status: status, // Potential = 0, Active = 1, Inactive = 2
      amount,
      description,
      attachments: attachmentsArray,
      notification_date: applicationDate as TDateISO,
      application_requirements : "",
    additional_notes : "",
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
        <h2>New Grant</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {/* Row 1 */}

        <div className="left-cols">

          <div >
            <label >Organization Name</label>
            <input
              className="long-input"
              type="text"
              placeholder="Click to edit name"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>

          <div className="date-entry" >
            
            <div>
              <label >Application Date</label>
              <input
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
              />
            </div>
            
            <div >
              <label >Grant Start Date</label>
              <input
                type="date"
                value={grantStartDate}
                onChange={(e) => setGrantStartDate(e.target.value)}
              />
            </div>

            <div>
              <label >Report Deadline</label>
              <input
                type="date"
                value={grantStartDate}
                onChange={(e) => setGrantStartDate(e.target.value)}
              />
            </div>
            
          </div>

          <label >Estimated Completion Time (in hours)</label>
          <input

            type="number"
            value={estimatedCompletionTimeInHours}
            onChange={(e) => setEstimatedCompletionTimeInHours(Number(e.target.value))}
            style={{ width: '66%' }}
          />

          <div>
            <label >Timeline (in years)</label>
            <input
    
              type="number"
              value={timelineInYears}
              onChange={(e) => setTimelineInYears(Number(e.target.value))}
            />
          </div>
          
          <label >Amount</label>
          <input
            type="number"
            placeholder="$0.00"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          
        </div>
        

        
        
        


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

        

        <label className="label-col">Report Date</label>
        <input
          className="input-col"
          type="date"
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
        />

        {/* Row 3: Times */}

        

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
          <option value={Status.Potential}>Potential</option>
          <option value={Status.Active}>Active</option>
          <option value={Status.Inactive}>Inactive</option>
        </select>

        {/* Row 5: Amount */}
        

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
