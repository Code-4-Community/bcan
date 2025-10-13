// frontend/src/grant-info/components/NewGrantModal.tsx
import React, { useState, createRef, RefObject } from "react";
import { fetchAllGrants } from "../../../external/bcanSatchel/actions";
import "../styles/NewGrantModal.css";
import POCEntry from "./POCEntry";
import { Grant } from "../../../../middle-layer/types/Grant";
import { TDateISO } from "../../../../backend/src/utils/date";
import { Status } from "../../../../middle-layer/types/Status";
import { api } from "../../api";
import { MdOutlinePerson2 } from "react-icons/md";

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

    <div className="modal-overlay"> {/*Greyed out background */}
      <div className="modal-content"> {/*Popup container */}
        <div className="flex">                         {/*Widget container */}

          {/*left column */}
          <div className='w-1/2 p-4 h-full'>
            <h2>New Grant</h2>

              {/*Organization name and input */}
              <div className="w-full md:mb-0 ">
                <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                  Organization Name
                </label>
                <input style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                className="h-14 block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight" id="grid-first-name" type="text" placeholder="Type Here"/>
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
                    <input style={{color : "gray", backgroundColor: '#F2EBE4',borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                    className="h-14 appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" type="date"/>
                  </div>
                  {/*Grant Start Date and input */}
                  <div className=" w-1/2">
                    <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-state">
                      Grant Start Date
                    </label>
                      <input style={{color : "gray", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                      className="h-14 w-full appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" type="date"/>
                  </div>
                </div>

                {/*Estimated completition time and input - need to make wider (length of application date and grant start date)*/}
                <div className="w-full">
                  <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-state">
                  Estimated Completion Time
                  </label>
                  <input style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                  className="h-14 appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" />
                </div>

              </div>

              {/*Right column*/}
              <div className="w-1/3">
                {/*Report deadlines label and grey box */}
                <div className="h-full" >
                  <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-zip">
                      Report Deadlines
                  </label>
                  <div className="p-2 rounded h-60" style={{backgroundColor: '#D3D3D3', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}>
                      <input style={{color : "gray", backgroundColor: '#F2EBE4',borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                      className="h-14 w-full text-gray-700 rounded" id="grid-city" type="date"/>
                      <button style={{color : "black", backgroundColor: "#F58D5C", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}} className="h-10 w-full mt-2">Add Deadline +</button>
                  </div>
                </div>
              </div>
              
            </div>

              {/*Timeline label and input */}
              <div className="w-full  md:mb-0 ">
                <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                  Timeline (in years)
                </label>
                <input  style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                className="h-14 appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="Type Here"/>
              </div>

              {/*Amount label and input */}
              <div className="w-full mt-5 md:mb-0 ">
                <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                  Amount
                </label>
                <input style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                className="h-14 appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" id="grid-first-name" type="text" placeholder="Type Here"/>
              </div>

          </div>

          {/*Right column */}
          <div className='p-4 w-1/2 mt-12 h-full'>

            {/*POC row */}
            <div className="flex w-full h-1/2 mt-5">
              {/*BCAN POC div*/}
              <div className="w-full mt-1 p-2">
                  <label className="mb-1 flex block uppercase tracking-wide text-gray-700 text-xs font-bold" htmlFor="grid-zip">
                      BCAN POC
                  </label>
                  {/*Box div*/} 
                  <div className="items-center flex p-3 rounded h-52" style={{backgroundColor: "#F58D5C", borderColor: 'black', borderWidth: '1px'}}>
                      <MdOutlinePerson2 className="w-1/4 h-full p-1"/>
                      <div className="w-3/4">
                        <input style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                        className="h-14 w-full text-gray-700 rounded" id="grid-city" placeholder="Name" />
                        <input style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                        className="h-14 w-full text-gray-700 rounded" id="grid-city" placeholder="e-mail" />
                      </div> 
                  </div>
              </div>

              {/*Grant Provider POC div*/}
              <div className="p-2 w-full mt-1 ">
                  <label className="mb-1 flex block uppercase tracking-wide text-gray-700 text-xs font-bold" htmlFor="grid-zip">
                      Grant Provider POC
                  </label>
                  {/*Box div*/}
                  <div className="flex p-3 rounded h-52 items-center" style={{backgroundColor: "#F58D5C", borderColor: 'black', borderWidth: '1px'}}>
                      <MdOutlinePerson2 className="p-1 w-1/4 h-full"/>
                      <div className="w-3/4">
                        <input style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                        className="h-14 w-full text-gray-700 rounded" id="grid-city" placeholder="Name" />
                        <input style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                        className="h-14 w-full text-gray-700 rounded" id="grid-city" placeholder="e-mail" />
                      </div> 
                  </div>
              </div>
            </div>

            {/*bottom  right row*/}
            <div className="flex h-full w-full">
               {/* Select option menus */}
                <div className="p-2 h-full w-1/2 flex-col">
                  {/*Qualify label and input */}
                  <div className="w-full ">
                    <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                      Does BCAN qualify?
                    </label>
                    <select style={{color: "gray", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                      className="h-14 appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                      id="grid-first-name">
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {/*Status label and input */}
                  <div className="w-full mt-5 md:mb-0 ">
                    <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                      Status
                    </label>
                    <select style={{color: "gray", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                      className="h-14 appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                      id="grid-first-name">
                      <option value="">Select...</option>
                      <option value="potential">Potential</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="rejected">Rejected</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  {/*Restriction types label and input */}
                  <div className="w-full mt-5 md:mb-0 ">
                    <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                      Restriction types
                    </label>
                    <select style={{color: "gray", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                      className="h-14 appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" 
                      id="grid-first-name">
                      <option value="">Select...</option>
                      <option value="restricted">Restricted</option>
                      <option value="unrestricted">Unrestricted</option>
                    </select>
                  </div>
                </div>

              {/*Scope Documents div p-2 h-full w-1/2 flex-col*/}
              <div className="p-2 h-full w-1/2 flex-col">
                  <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold" htmlFor="grid-zip">
                      Scope Documents
                  </label>
                  <button style={{color : "black", backgroundColor: "gray", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}className="w-full mt-2 h-12">Upload Documents +</button>
                  {/*Box div*/}
                  <div className="flex rounded h-48 mt-4" style={{backgroundColor: '#D3D3D3', borderColor: 'black', borderWidth: '1px'}}></div>
              </div>
            {/*End bottom right row */}
            </div>
          {/*End right column */}
          </div>
 
        {/*End grid content*/}
        </div>

        {/*Description and input */}
              <div className="w-full md:mb-0 ">
                <label className="flex block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-first-name">
                  Description
                </label>
                <input style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                className="h-48 block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight" id="grid-first-name" type="text"/>
              </div>
      
        <div className="button-row">
          <button style={{color : "black", backgroundColor: "white", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}} onClick={onClose} >Close</button>
          <button style={{color : "black", backgroundColor: "#F58D5C", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}onClick={handleSubmit}>Save</button>
        </div>

      {/*End modal content */}
      </div>

    {/*End modal overlay */}
    </div>
    
    
  );
};

export default NewGrantModal;
