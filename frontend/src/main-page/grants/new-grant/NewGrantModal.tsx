// frontend/src/grant-info/components/NewGrantModal.tsx
import React, { useState, createRef, RefObject } from "react";
import CurrencyInput from 'react-currency-input-field';
import { fetchAllGrants } from "../../../external/bcanSatchel/actions";
import "../styles/NewGrantModal.css";
import POCEntry from "./POCEntry";
import { MdOutlinePerson2 } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { TDateISO } from "../../../../../backend/src/utils/date";
import { Status,
  // statusToString
   } from "../../../../../middle-layer/types/Status";
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

interface NewGrantModalProps {
  grant?: Grant;
  onClose: () => void;
}


const NewGrantModal: React.FC<NewGrantModalProps> = ({ onClose }) => {
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
  const [estimatedCompletionTimeInHours, _setEstimatedCompletionTimeInHours] = useState<number>(0);

  const [doesBcanQualify, setDoesBcanQualify] = useState<string>("");

  const [isRestricted, setIsRestricted] = useState<string>("");

  const [status, setStatus] = useState<string>("");

  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");

  // Attachments array
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [newAttachment, setNewAttachment] = useState<Attachment>({
    attachment_name: "",
    url: "",
    type: AttachmentType.SCOPE_DOCUMENT,
  });

  // For error handling
    // @ts-exopect-error
  const [_errorMessage, setErrorMessage] = useState<string>("");
  const [bcanPocName, setBcanPocName] = useState('');
  const [bcanPocEmail, setBcanPocEmail] = useState('');
  const [grantProviderPocName, setGrantProviderPocName] = useState('');
  const [grantProviderPocEmail, setGrantProviderPocEmail] = useState('');

  /** Add a new BCAN POC entry */
  // @ts-ignore
  const _addBcanPoc = () => {
    const newRef = createRef<POCEntryRef>();
    const newPOC = <POCEntry ref={newRef} key={`bcan-${bcanPocComponents.length}`} />;
    setBcanPocComponents([...bcanPocComponents, newPOC]);
    setBcanPocRefs([...bcanPocRefs, newRef]);
  };

  /** Add a new Grant Provider POC entry */
  // @ts-ignore
  const _addGrantProviderPoc = () => {
    const newRef = createRef<POCEntryRef>();
    const newPOC = <POCEntry ref={newRef} key={`provider-${grantProviderPocComponents.length}`} />;
    setGrantProviderPocComponents([...grantProviderPocComponents, newPOC]);
    setGrantProviderPocRefs([...grantProviderPocRefs, newRef]);
  };

  /* Add a new blank report date to the list */
  // @ts-ignore
  const _addReportDate = () => {
    setReportDates([...reportDates, ""]);
  };

  // @ts-ignore
  const _removeReportDate = (index: number) => {
    const updated = [...reportDates];
    updated.splice(index, 1);
    setReportDates(updated);
  };
  
  // @ts-ignore
  const _handleReportDateChange = (index: number, value: string) => {
    const updated = [...reportDates];
    updated[index] = value;
    setReportDates(updated);
  };

  // Add an empty attachment row
  const addAttachment = () => {
    if (!newAttachment.attachment_name || !newAttachment.url) return;
    setAttachments([...attachments, newAttachment]);
    setNewAttachment({
      attachment_name: "",
      url: "",
      type: AttachmentType.SCOPE_DOCUMENT,
    });
  };

  // Remove a specific attachment row
  // @ts-ignore
  const _removeAttachment = (index: number) => {
    const updated = [...attachments];
    updated.splice(index, 1);
    setAttachments(updated);
    if (updated.length === 0) setIsAddingAttachment(false);
  };

  // Update a field in one attachment
  // @ts-ignore
  const _handleAttachmentChange = (
    index: number,
    field: keyof Attachment,
    value: string | AttachmentType
  ) => {
    const updated = [...attachments];
    // @ts-expect-error - Keeping for future use
    updated[index][field] = value;
    setAttachments(updated);
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
    if (doesBcanQualify == "") {
      setErrorMessage("Set Does Bcan Qualify? to 'yes' or 'no' ");
    }
    if (isRestricted == "") {
      setErrorMessage("Set Restriction Type to 'restricted' or 'unrestricted' ");
    }
    if (status == "") {
      setErrorMessage("Set Status");
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
      does_bcan_qualify: (doesBcanQualify == "yes" ? true : false),
      amount,
      grant_start_date: grantStartDate as TDateISO,
      application_deadline: applicationDate as TDateISO,
      status: status as Status, // Potential = 0, Active = 1, Inactive = 2
      bcan_poc: bcanPocList.length > 0 ? { POC_name: "", POC_email: bcanPocList[0] } : { POC_name: "", POC_email: ""}, // Just take the first for now
      grantmaker_poc: providerPocList.length > 0 ? { POC_name: "", POC_email: providerPocList[0] } : { POC_name: "", POC_email: ""}, // Just take the first for now
      report_deadlines: reportDates as TDateISO[],
      timeline: timelineInYears,
      estimated_completion_time: estimatedCompletionTimeInHours,
      description,
      attachments: attachmentsArray,
      isRestricted: (isRestricted == "restricted" ? true : false), // Default to unrestricted for now
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

  // function formatDate(isoString: string): string {
  //   const date = new Date(isoString);
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }

  // function formatCurrency(amount : number): string {
  //   const formattedCurrency = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD',
  //   maximumFractionDigits:0}).format(amount);
  //   return formattedCurrency;
  // }

  return (

    <div className="modal-overlay"> {/*Greyed out background */}
      <div className="modal-content "> {/*Popup container */}
        <h2 className="font-family-helvetica">New Grant</h2>
        <div className="flex">  {/* Major components in two columns */}
          {/*left column */}
          <div className='w-1/2  pr-5'>
              {/*Organization name and input */}
              <div className="w-full md:mb-0">
                <label className="font-family-helvetica text-lg flex block text-black  mb-1" htmlFor="grid-first-name">
                  Organization Name
                </label>
                <input style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                className=" font-family-helvetica block w-full text-black placeholder:text-gray-400 border rounded py-3 px-4 mb-3 leading-tight" 
                id="grid-first-name"
                 type="text" 
                 placeholder="Type Here"
                 onChange={(e) => setOrganization(e.target.value)}/>
              </div>

            {/*Top left quadrant - from app date, start date, report deadlines, est completion time*/}
            <div className="flex  w-full space-x-4 mt-5 ">

              {/* Left column: Application + Grant Start row */}
              <div className="w-2/3">

                {/*Application date and grant start date */}
                <div className="flex space-x-4">
                  {/*Application date and input */}
                  <div className="w-1/2">
                    <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-city">
                    Application Date
                    </label>
                    <input style={{height: "48px", backgroundColor: '#F2EBE4',borderStyle: 'solid', borderColor: 'black', borderWidth: '1px', color: applicationDate ? "black" : "gray"}}
                    className="font-family-helvetica appearance-none block w-full border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                    id="grid-city" 
                    type="date"

                    onChange={(e) => setApplicationDate(e.target.value)}/>
                  </div>
                  {/*Grant Start Date and input */}
                  <div className=" w-1/2">
                    <label className="font-family-helvetica flex block tracking-wide text-black text-black text-lg mb-1" htmlFor="grid-state">
                      Grant Start Date
                    </label>
                      <input style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px', color: grantStartDate ? "black" : "gray"}}
                      className="font-family-helvetica w-full appearance-none block w-full bg-gray-200 text-black placeholder:text-gray-400 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                      id="grid-city" 
                      type="date"
                      onChange={(e) => setGrantStartDate(e.target.value)}/>
                  </div>
                </div>

                {/*Estimated completition time and input - need to make wider (length of application date and grant start date)*/}
                <div className="w-full mt-10">
                  <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-state">
                  Estimated Completion Time (in hours)
                  </label>
                  <input type="number" 
                  min = "0"
                  style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                  className="font-family-helvetica appearance-none block w-full bg-gray-200 text-black placeholder:text-gray-400 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                  id="grid-city"
                  onChange={(e) => _setEstimatedCompletionTimeInHours(Number(e.target.value))}/>
                </div>

              </div>

              {/*Right column*/}
              <div className="w-1/3 ">
                {/*Report deadlines label and grey box */}
                <div className="h-full" >
                  <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-zip">
                      Report Deadlines
                  </label> 
                  <div className="p-2 rounded h-56 overflow-y-auto overflow-x-hidden" style={{backgroundColor: '#D3D3D3', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px', borderRadius:"1.2rem"}}>
                      {reportDates.map((date, index) => (
                        <div key={index} className="flex gap-2 mb-2 w-full">
                          <input 
                            key={index}
                            style={{height: "42px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                            className="font-family-helvetica flex-1 min-w-0 text-black rounded" 
                            type="date"
                            value={date}
                            onChange={(e) => {
                              const newDates = [...reportDates];
                              newDates[index] = e.target.value;
                              setReportDates(newDates);
                            }}
                          />
                          {reportDates.length > 0 && (
                            <button
                              style={{height: "42px",backgroundColor: '#FF6B6B', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                              className="font-family-helvetica w-5 flex-shrink-0 rounded text-white font-bold flex items-center justify-center"
                              onClick={() => _removeReportDate(index)}
                            >
                              ✕
                            </button>
                          )}
                      </div>

                      ))}
                      <button 
                        style={{height: "42px", color: "black", backgroundColor: "#F58D5C", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}} 
                        className="font-family-helvetica w-full mt-2 flex items-center justify-center"
                        onClick={_addReportDate}
                      >
                        Add Deadline +
                      </button>
                    </div>
                </div>
              {/*End report deadline */}
              </div>
              
            </div>

              {/*Timeline label and input */}
              <div className="w-full -mt-4">
                <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-first-name">
                  Timeline (in years)
                </label>
                <input  style={{height: "42px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                className="font-family-helvetica appearance-none block w-full bg-gray-200 text-black placeholder:text-gray-400 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                type="number" min = "0" placeholder="Type Here" onChange={(e) => setTimelineInYears(Number(e.target.value))}/>
              </div>

              {/*Amount label and input */}
              <div className="w-full mt-5 md:mb-0 ">
                <label className="font-family-helvetica flex block tracking-wide text-black placeholder:text-gray-400 text-lg mb-1" htmlFor="grid-first-name">
                  Amount (in $)
                </label>
                <CurrencyInput style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                className="font-family-helvetica appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                min={0} decimalsLimit={2} placeholder="Type Here" onValueChange={(value) => setAmount(Number(value))}/>
              </div>

          </div>

          {/*Right column */}
          <div className='w-1/2 pl-5'>

            {/*POC row */}
            <div className="flex w-full mb-[74px]">
              {/*BCAN POC div*/}
              <div className="w-full pr-3">
                  <label className="font-family-helvetica mb-1 flex block tracking-wide text-black text-lg" htmlFor="grid-zip">
                      BCAN POC
                  </label>
                  {/*Box div*/} 
                  <div className="items-center flex p-3 rounded h-full" style={{backgroundColor: "#F58D5C", borderColor: 'black', borderWidth: '1px', borderRadius:"1.2rem"}}>
                      <MdOutlinePerson2 className="w-1/4 h-full p-1"/>
                      <div className="w-3/4">
                        <input style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                        className="font-family-helvetica w-full text-gray-700 rounded" id="grid-city" placeholder="Name" value={bcanPocName} onChange={(e) => setBcanPocName(e.target.value)}/>
                        <input style={{height: "48px",backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                        className="font-family-helvetica w-full text-gray-700 rounded"
                         id="grid-city" placeholder="e-mail" value={bcanPocEmail} onChange={(e) => setBcanPocEmail(e.target.value)}/>
                      </div> 
                  </div>
              </div>

              {/*Grant Provider POC div*/}
              <div className="w-full pl-3">
                  <label className="font-family-helvetica mb-1 flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-zip">
                      Grant Provider POC
                  </label>
                  {/*Box div*/}
                  <div className="flex p-3 rounded  items-center h-full" style={{backgroundColor: "#F58D5C", borderColor: 'black', borderWidth: '1px', borderRadius:"1.2rem"}}>
                      <MdOutlinePerson2 className="p-1 w-1/4 h-full"/>
                      <div className="w-3/4">
                        <input style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                        className="font-family-helvetica w-full text-gray-700 rounded" id="grid-city" placeholder="Name" value={grantProviderPocName} onChange={(e) => setGrantProviderPocName(e.target.value)}/>
                        <input style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                        className="font-family-helvetica w-full text-gray-700 rounded" id="grid-city" placeholder="e-mail" value={grantProviderPocEmail} onChange={(e) => setGrantProviderPocEmail(e.target.value)}/>
                      </div> 
                  </div>
              </div>
            </div>

            {/*bottom  right row*/}
            <div className="flex w-full ">
               {/* Select option menus */}
                <div className="w-1/2 flex-col pr-3">
                  {/*Qualify label and input */}
                  <div className="w-full ">
                    <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-first-name">
                      Does BCAN qualify?
                    </label>
                    <select style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px', color : doesBcanQualify == "" ? "gray" : "black"}}
                      className="font-family-helvetica appearance-none block w-full bg-gray-200 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                      id="grid-first-name" value={doesBcanQualify} onChange={(e) => setDoesBcanQualify(e.target.value)}>
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {/*Status label and input */}
                  <div className="w-full mt-5 ">
                    <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-first-name">
                      Status
                    </label>
                    <select style={{height: "48px",  backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px', color : status == "" ? "gray" : "black"}}
                      className="font-family-helvetica appearance-none block w-full bg-gray-200 text-black placeholder:text-gray-400 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                      id="grid-first-name" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                      <option value="">Select...</option>
                      <option value="Potential">Potential</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  {/*Restriction types label and input */}
                  <div className="w-full  md:mb-0 mt-5">
                    <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-first-name">
                      Restriction types
                    </label>
                    <select style={{height: "48px", backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px', color : isRestricted == "" ? "gray" : "black"}}
                      className="font-family-helvetica appearance-none block w-full bg-gray-200 border border-red-500 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white" 
                      id="grid-first-name" value={isRestricted} onChange={(e) => setIsRestricted(e.target.value)}>
                      <option value="">Select...</option>
                      <option style={{color:"black"}} value="unrestricted">Unrestricted</option>
                      <option style={{color:"black"}} value="restricted">Restricted</option>
                    </select>
                  </div>
                </div>

              {/*Scope Documents div p-2 h-full w-1/2 flex-col*/}
              <div className="w-1/2 flex-col pl-3">
                <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1">
                  Scope Documents
                </label>

                {/* Upload button */}
                {!isAddingAttachment && (
                  <button
                    type="button"
                    onClick={() => setIsAddingAttachment(true)}
                    style={{
                      height: "48px",
                      color: "black",
                      backgroundColor: "gray",
                      borderStyle: "solid",
                      borderColor: "black",
                      borderWidth: "1px",
                    }}
                    className="items-center flex font-family-helvetica w-full mt-1 mb-2 justify-center"
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
                          className="flex-1 px-2 border border-black rounded"
                          style={{ backgroundColor: "#F2EBE4", height: "42px" }}
                          value={newAttachment.attachment_name}
                          onChange={(e) =>
                            setNewAttachment({ ...newAttachment, attachment_name: e.target.value })
                          }
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          className="h-12 flex-1 px-2 border border-black rounded"
                          style={{ backgroundColor: "#F2EBE4", height: "42px" }}
                          value={newAttachment.url}
                          onChange={(e) =>
                            setNewAttachment({ ...newAttachment, url: e.target.value })
                          }
                        />
                        <select
                          className="h-12 border border-black rounded px-2 items-center justify-center"
                          style={{ backgroundColor: "#F2EBE4", height: "42px" }}
                          value={newAttachment.type}
                          onChange={(e) =>
                            setNewAttachment({
                              ...newAttachment,
                              type: Number(e.target.value) as AttachmentType,
                            })
                          }
                        >
                          <option  value={AttachmentType.SCOPE_DOCUMENT}>Scope</option>
                          <option  value={AttachmentType.SUPPORTING_RESOURCE}>
                            Supporting
                          </option>
                        </select>

                        <div className="flex justify-end">

                          <button
                            type="button"
                            onClick={() => setIsAddingAttachment(false)}
                            style={{backgroundColor: "#D3D3D3", color : "black", height: "21px"}}
                            className="mr-2 border border-black rounded  flex items-center justify-center"
                          >
                            Close
                          </button>

                          <button
                            type="button"
                            onClick={addAttachment}
                            style={{backgroundColor: "#F58D5C", color : "black", height: "21px"}}
                            className="border border-black rounded flex items-center justify-center"
                          >
                            Add + 
                          </button>

                        </div>
                        
                      </div>
     
                  </div>
                )}

                {/* Gray box showing added links */}
                <div
                  className=" p-2 rounded overflow-y-auto overflow-x-hidden"
                  style={{
                    backgroundColor: "#D3D3D3",
                    borderStyle: "solid",
                    borderColor: "black",
                    borderWidth: "1px",
                    borderRadius: "1.2rem",
                    height: isAddingAttachment ? "77px" : "192px" 
                  }}
                >
                  {attachments
                    .filter((a) => a.url) // show only filled ones
                    .map((attachment, index) => (
                      <div key={index} className="flex gap-2 mb-2 w-full items-center">
                        <div
                          style={{
                            height: "42px",
                            backgroundColor: "#F2EBE4",
                            borderStyle: "solid",
                            borderColor: "black",
                            borderWidth: "1px",
                            borderRadius: "1.2rem",
                          }}
                          className="overflow-hidden font-family-helvetica flex-1 min-w-0 text-gray-700 rounded flex items-center px-3 justify-between"
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
                            ({attachment.type === AttachmentType.SCOPE_DOCUMENT
                              ? "Scope"
                              : "Supporting"}
                            )
                          </span>
                        </div>
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
              <div className="w-full mt-5 p-2">
                <label className="font-family-helvetica flex block tracking-wide text-black text-lg mb-1" htmlFor="grid-first-name">
                  Description
                </label>
                <textarea style={{backgroundColor: '#F2EBE4', borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}
                className="font-family-helvetica h-48 block w-full text-gray-700 border rounded py-3 px-4 mb-3 leading-tight" id="grid-first-name" 
                value={description} onChange={(e) => setDescription(e.target.value)}/>
              </div>
      
        <div className="button-row">
          <button style={{fontFamily : "helvetica", color : "black", backgroundColor: "white", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}} onClick={onClose} >Close</button>
          <button style={{fontFamily : "helvetica", color : "black", backgroundColor: "#F58D5C", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}}onClick={handleSubmit}>Save</button>
        </div>

      {/*End modal content */}
      </div>

    {/*End modal overlay */}
    </div>
    
    
  );
};

export default NewGrantModal;
