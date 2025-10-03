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

    <div className="modal-overlay"> {/*Greyed out background */}
      <div className="modal-content"> {/*Popup container */}
        <form>                         {/*Widget container */}

          {/*left column */}
          <div className='w-1/2'>
            <h2>New Grant</h2>

              {/*Organization name and input */}
              <div className="w-full md:mb-0 ">
                <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                  Organization Name
                </label>
                <input className="h-16 appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="Type Here"/>
              </div>

            {/*Top left quadrant - from app date, start date, report deadlines, est completion time*/}
            <div className="flex  w-full space-x-4 mt-5 ">

              {/* Left column: Application + Grant Start row */}
              <div className="w-2/3">

                {/*Application date and grant start date */}
                <div className="flex space-x-4 mb-5">
                  {/*Application date and input */}
                  <div className="w-1/2">
                    <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-city">
                    Application Date
                    </label>
                    <input className="h-16 appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" type="date"/>
                  </div>
                  {/*Grant Start Date and input */}
                  <div className=" w-1/2">
                    <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-state">
                      Grant Start Date
                    </label>
                      <input className="h-16 w-full appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" type="date"/>
                  </div>
                </div>

                {/*Estimated completition time and input - need to make wider (length of application date and grant start date)*/}
                <div className="w-full">
                  <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-state">
                  Estimated Completion Time
                  </label>
                  <input className="h-16 appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" />
                </div>

              </div>

              {/*Right column*/}
              <div className="w-1/3">
                {/*Report deadlines label and grey box */}
                <div className="h-full">
                  <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold" htmlFor="grid-zip">
                      Report Deadlines
                  </label>
                  <div className="p-3 rounded h-60" style={{backgroundColor: '#D3D3D3'}}>
                      <input className="h-16 w-full text-gray-700 rounded" id="grid-city" type="date"/>
                      <button className="h-10 w-full mt-2">Add Deadline +</button>
                  </div>
                </div>
              </div>
              
            </div>

            {/*Timeline label and input */}
              <div className="w-full  md:mb-0 ">
                <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                  Timeline (in years)
                </label>
                <input className="h-16 appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="Type Here"/>
              </div>

            {/*Amount label and input */}
              <div className="w-full mt-5 md:mb-0 ">
                <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                  Amount
                </label>
                <input className="h-16 appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="Type Here"/>
              </div>

          </div>
          



          
          
            
          

        </form>
        <div className="button-row">
          <button onClick={onClose}>Close</button>
          <button onClick={handleSubmit}>Save</button>
        </div>

    </div>

    </div>
    
    
  );
};

export default NewGrantModal;
