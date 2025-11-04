import React, { useEffect, useState } from "react";
import "../styles/GrantItem.css";
import StatusIndicator from "./StatusIndicator";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { DoesBcanQualifyText } from "../../../translations/general";
import RingButton, { ButtonColorOption } from "../../../custom/RingButton";
import { Status } from "../../../../../middle-layer/types/Status";
import { api } from "../../../api";
import { MdOutlinePerson2 } from "react-icons/md";
import Attachment from "../../../../../middle-layer/types/Attachment";
import NewGrantModal from "../new-grant/NewGrantModal";

interface GrantItemProps {
  grant: Grant;
  defaultExpanded?: boolean;
}

const GrantItem: React.FC<GrantItemProps> = ({ grant, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [curGrant, setCurGrant] = useState(grant);
  const [showNewGrantModal, setShowNewGrantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Track whether each custom dropdown is open.
  const [qualifyDropdownOpen, setQualifyDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const toggleExpand = () => {
    // Toggle edit mode off now that we are leaving this specific grant in view
    if (isExpanded) {
      toggleEdit();
    }
    setIsExpanded(!isExpanded);
  };

  // Sync isExpanded with the defaultExpanded prop.
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const toggleEdit = async () => {
    if (isEditing) {
      // Save changes when exiting edit mode.
      try {
        const response = await api("/grant/save", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(curGrant),
        });
        const result = await response.json();
        console.log(result);
      } catch (err) {
        console.error("Error saving data:", err);
      }
    }
    setIsEditing(!isEditing);
    setQualifyDropdownOpen(false);
    setStatusDropdownOpen(false);
  };

  {/* The popup that appears on delete */}
  const DeleteModal = ({ 
    isOpen, 
    onCloseDelete, 
    onConfirmDelete, 
    title = "Are you sure?",
    message = "This action cannot be undone."
  }: {
    isOpen: boolean;
    onCloseDelete: () => void;
    onConfirmDelete: () => void;
    title?: string;
    message?: string;
  }) => {
    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
        onClick={onCloseDelete}
      >
        <div 
          style={{
            borderStyle: 'solid',
            borderColor: 'black',
            borderWidth: '2px'
          }}
          className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <svg 
                className="w-12 h-12 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              style={{
                backgroundColor: '#F2EBE4',
                borderStyle: 'solid',
                borderColor: 'black',
                borderWidth: '1px'
              }}
              className="flex-1 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              onClick={onCloseDelete}
            >
              Cancel
            </button>
            <button
              style={{
                backgroundColor: 'indianred',
                borderStyle: 'solid',
                borderColor: 'indianred',
                borderWidth: '1px'
              }}
              className="flex-1 py-3 px-4 rounded-lg font-semibold text-white hover:bg-red-700 transition-colors"
              onClick={() => {
                onConfirmDelete();
                onCloseDelete();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  function formatCurrency(amount : number): string {
    const formattedCurrency = new Intl.NumberFormat('en-US', {style: 'currency',currency: 'USD',
    maximumFractionDigits:0}).format(amount);
    return formattedCurrency;
  }

  return (
    <div className="grant-item-wrapper">
      <div
        className={`grant-summary p-4 ${isExpanded ? "expanded rounded-b-none" : ""} grid grid-cols-5 items-center`}
        onClick={toggleExpand}
      >
        <li className="font-bold text-left flex items-center">
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          <span className="ml-2 truncate">{curGrant.organization}</span>
        </li>
        <li className="application-date">
          {curGrant.application_deadline 
            ? new Date(curGrant.application_deadline).toLocaleDateString() 
            : "No date"}
        </li>
        <li className="amount">
          {formatCurrency(curGrant.amount)}
        </li>
        <li className="does-bcan-qualify">
          {isEditing ? (
            <div className="custom-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
              <div onClick={() => setQualifyDropdownOpen(!qualifyDropdownOpen)}>
                <RingButton 
                  text={curGrant.does_bcan_qualify ? DoesBcanQualifyText.Yes : DoesBcanQualifyText.No}
                  color={curGrant.does_bcan_qualify ? ButtonColorOption.GREEN : ButtonColorOption.GRAY} 
                />
              </div>
              {qualifyDropdownOpen && (
                <div className="custom-dropdown">
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, does_bcan_qualify: true });
                      setQualifyDropdownOpen(false);
                    }}
                  >
                    <RingButton text={DoesBcanQualifyText.Yes} color={ButtonColorOption.GREEN} />
                  </div>
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, does_bcan_qualify: false });
                      setQualifyDropdownOpen(false);
                    }}
                  >
                    <RingButton text={DoesBcanQualifyText.No} color={ButtonColorOption.GRAY} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            curGrant.does_bcan_qualify ? (
              <RingButton text={DoesBcanQualifyText.Yes} color={ButtonColorOption.GREEN} />
            ) : (
              <RingButton text={DoesBcanQualifyText.No} color={ButtonColorOption.GRAY} />
            )
          )}
        </li>
        <li className="flex justify-center items-center text-center">
          {isEditing ? (
            <div className="custom-dropdown-wrapper" onClick={(e) => e.stopPropagation()}>
              <div onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}>
                <div className="status-button-preview">
                  <StatusIndicator curStatus={curGrant.status} />
                </div>
              </div>
              {statusDropdownOpen && (
                <div className="custom-dropdown">
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, status: Status.Active });
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className="button-default green-button">Active</div>
                  </div>
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, status: Status.Inactive });
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className="button-default gray-button">Inactive</div>
                  </div>
                  <div
                    className="custom-dropdown-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurGrant({ ...curGrant, status: Status.Potential });
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className="button-default orange-button">Potential</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <StatusIndicator curStatus={curGrant.status} />
          )}
        </li>
      </div>

      <div className={`grant-body bg-white ${isExpanded ? "expanded" : ""}`}>
        {isExpanded && (
        <div > 

          {/*div for the two columns above description*/}
          <div className="flex  mt-6 mb-6">

            {/*Left column */}
            <div className="w-1/2 ">

              {/*Organization name (only div in the first row) */}
              <div className="text-left mb-6 text-lg">
                <label className="font-semibold text-left text-lg"> Organization Name</label>
                <div className="text-left ">{curGrant.organization}</div>
              </div>

              {/*Col of gray labels + col of report deadliens (below org name) */}
              <div className="flex"> 
                {/*Left column of gray labels */}
                <div className="w-1/2"> 

                  {/*Application date and grant start date row*/}
                  <div className="flex space-x-4 w-full mb-10">
                    {/*Application date*/}
                    <div className="w-1/2 mb-3">
                      <label className="flex block  tracking-wide text-gray-700 font-bold mb-2" htmlFor="grid-city">
                        Application Date
                        </label>
                      <div 
                        style={{color: "black", backgroundColor: "#D3D3D3"}} 
                        className="h-9  flex items-center justify-center w-full rounded-full px-4"
                        >
                        {formatDate(curGrant.application_deadline)}
                      </div>
                    </div>
                    {/*Grant Start Date */}
                    <div className=" w-1/2">
                      <label className="flex block tracking-wide text-gray-700 font-bold mb-2" htmlFor="grid-state">
                        Grant Start Date
                        </label>
                        <div 
                          style={{color: "black", backgroundColor: "#D3D3D3"}}
                          className="h-9 flex items-center justify-center w-full rounded-full px-4"
                          >
                          {curGrant.grant_start_date}
                        </div>
                    </div>

                  {/*End application date and grant start date row */}
                  </div>

                  {/*Estimated completion time row*/}
                  <div className="w-full justify-center">
                    <label className="text-lg mt-2 flex block tracking-wide text-gray-700 font-bold mb-2" htmlFor="grid-state">
                      Estimated Completion Time
                    </label>
                    <div 
                      style={{color: "black"}}
                      className="text-left text-lg h-10 flex w-2/3  "
                    >
                      {curGrant.estimated_completion_time + " hours"}
                    </div>
                  </div>

                  
                {/*End column of gray labels */}
                </div>

                {/*Report deadlines div*/}
                <div className="w-1/2 h-full pl-5">
                  <label className="flex block tracking-wide text-gray-700 font-bold mb-2">
                    Report Deadlines
                  </label>
                  <div
                    className="p-2 rounded h-52 w-4/5"
                    style={{
                      backgroundColor: "#F58D5C", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'
                    }}
                  >
                    {/*Map each available report deadline to a div label
                    If no deadlines, add "No deadlines" text */}
                    {curGrant.report_deadlines && curGrant.report_deadlines.length > 0 ? (
                      curGrant.report_deadlines.map((deadline: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            color: "black",
                            backgroundColor: "#D3D3D3",
                          }}
                          className="h-10 flex items-center justify-center w-full rounded-full mb-2 px-4"
                        >
                          {formatDate(deadline)}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-700 italic">No deadlines</div>
                    )}
                    </div>
                {/*End report deadlines div*/}
                </div>

              {/* End row of gray labels (application date, grant start date, estimated completion time) to next of report deadline + report deadline */}
              </div>

              {/*Timeline and Amount row*/}
              <div className="flex space-x-4 mt-5 w-1/2">
                {/*Timeline*/}
                <div className="w-1/2">
                  <label className="text-lg flex block tracking-wide text-gray-700 font-bold mb-2" htmlFor="grid-city">
                  Timeline 
                  </label>
                  <div 
                    style={{color: "black"}}
                    className="text-left text-lg h-10 w-full"
                  >
                    {curGrant.timeline + " years"}
                  </div>
                </div>
                {/*Amount */}
                <div className=" w-1/2">
                  <label className="text-lg flex block tracking-wide text-gray-700 font-bold mb-2" htmlFor="grid-state">
                    Amount
                  </label>
                    <div 
                    style={{color: "black"}}
                    className="text-left text-lg h-10 w-full"
                  >
                  {formatCurrency(curGrant.amount)}
                  </div>
                </div>
              {/*End timeline and amount row */}
              </div>

              

            {/*End left column */}
            </div>

            {/*Right column */}
            <div className="w-1/2 "> 
              {/*POC row */}
              <div className="flex w-full mb-4">
                {/*BCAN POC div*/}
                <div className="w-full pr-3">
                  <label className="text-lg mb-2 flex block tracking-wide text-gray-700 font-bold" htmlFor="grid-zip">
                      BCAN POC
                  </label>
                  {/*Box div*/} 
                  <div className="items-center flex rounded" style={{backgroundColor: "#F58D5C", borderColor: 'black', borderWidth: '1px'}}>
                      <MdOutlinePerson2 className="w-1/4 h-full "/>
                      <div style={{ backgroundColor : '#F2EBE4' }} className="w-3/4 border-l border-black bg-[#FFCEB6] ">
                        <h2
                        className="px-2 text-left font-bold h-14 w-full text-gray-700 rounded flex items-center" id="grid-city"> {curGrant.bcan_poc?.POC_name ?? 'Unknown'} </h2>
                        <h2 
                        className="px-2 text-left h-14 w-full text-gray-700 rounded flex items-center" id="grid-city" > {curGrant.bcan_poc?.POC_email ?? '----------'} </h2>
                      </div> 
                  </div>
                </div>

                {/*Grant Provider POC div*/}
                <div className="w-full pl-3">
                  <label className="text-lg mb-2 flex block tracking-wide text-gray-700 font-bold" htmlFor="grid-zip">
                      Grant Provider POC
                  </label>
                  {/*Box div*/}
                  <div className="items-center flex rounded" style={{backgroundColor: "#F58D5C", borderColor: 'black', borderWidth: '1px'}}>
                      <MdOutlinePerson2 className="w-1/4 h-full"/>
                      <div style={{ backgroundColor : '#F2EBE4' }} className="w-3/4 border-l border-black bg-[#FFCEB6] ">
                        <h2 
                        className="px-2 text-left font-bold h-14 w-full text-gray-700 rounded flex items-center" id="grid-city"  > {curGrant.grantmaker_poc?.POC_name ?? 'Unknown'}</h2>
                        <h2
                        className="px-2 text-left h-14 w-full text-gray-700 rounded flex items-center" id="grid-city"> {curGrant.grantmaker_poc?.POC_email ?? '----------'} </h2>
                      </div> 
                  </div>
                </div>
              {/*End POC row */}
              </div>

              {/* Colored attributes  + scope documents row*/}
              <div className="flex justify-between">
                  {/*Colored attributes col */}
                  <div className="w-1/2 pr-3 "> 

                    {/*Does BCAN qualify  */}
                    <div  className="w-full mb-3">
                      <label className="text-lg flex block tracking-wide text-gray-700 font-bold mb-1" htmlFor="grid-city">
                        Does BCAN qualify?
                      </label>  
                      <div 
                        style={{color: "black", 
                          backgroundColor: curGrant.does_bcan_qualify ? ButtonColorOption.GREEN : ButtonColorOption.GRAY}}
                        className="w-3/5 h-9 flex items-center justify-center rounded-full  px-4"
                        >
                        {curGrant.does_bcan_qualify ? "Yes" : "No"}
                      </div>
                    </div>

                    {/*Status*/}
                    <div  className="w-full mb-3">
                      <label className="text-lg flex block tracking-wide text-gray-700 font-bold mb-1" htmlFor="grid-city">
                        Status
                      </label>  
                      <div 
                        style={{color: "black", 
                          backgroundColor: curGrant.status === "Active" 
                                              ? ButtonColorOption.GREEN 
                                              : curGrant.status === "Potential" 
                                                ? ButtonColorOption.ORANGE 
                                                : ButtonColorOption.GRAY}}
                        className="w-3/5 h-9 flex items-center justify-center rounded-full  px-4"
                        >
                        {curGrant.status}
                      </div>

                    </div>

                    {/*Restriction*/}
                    <div  className="w-full mb-3">
                      <label className="text-lg flex block tracking-wide text-gray-700 font-bold mb-1" htmlFor="grid-city">
                        Is BCAN Restricted?
                      </label>  
                      <div 
                        style={{color: "black", 
                          backgroundColor: curGrant.isRestricted ?  "indianred" : ButtonColorOption.GRAY}}
                        className="w-3/5 h-9 flex items-center justify-center rounded-full  px-4"
                        >
                        {curGrant.isRestricted ? "Restricted" : "Not Restricted"}
                      </div>
                    </div>
                  {/*End colored attributes col*/}
                  </div>

                  {/*Scope documents div*/}
                  <div className="w-1/2 pl-3">
                    <label className="text-lg flex block tracking-wide text-gray-700 font-bold mb-2 ">
                      Scope Documents
                    </label>
                    <div
                      className="p-2 rounded h-48"
                      style={{
                        backgroundColor: ButtonColorOption.GRAY, borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'
                      }}
                    >
                      {/*Map each available report deadline to a div label
                      If no deadlines, add "No deadlines" text */}
                      {curGrant.attachments && curGrant.attachments.length > 0 ? (
                        curGrant.attachments.map((attachment: Attachment, index: number) => (
                          <div
                            key={index}
                            style={{
                              color: "black",
                              borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'
                            }}
                            className="h-10 flex items-center justify-center w-full rounded-lg mb-2 px-4 bg-tan"
                          >
                            {attachment.url}
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-700 italic">No documents</div>
                      )}
                      </div>
                  {/*End scope docs div*/}
                  </div>
                
              </div>

              
            
            {/*End right column */}
            </div>
          
          {/*End two main left right columns */}
          </div>

          {/*Description*/}
          <div className="w-full mb-3">
            <label className="text-lg flex block  tracking-wide text-gray-700  font-bold mb-2" htmlFor="grid-city">
              Description
              </label>
            <div 
              style={{color: "black", borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'}} 
              className=" h-40 bg-tan flex  w-full rounded-lg  p-5 "
              >
              {curGrant.description}
            </div>
          </div>

          {/*bottom buttons */}
          <div className="flex justify-between items-center w-full mt-6 mb-6" >
            <>
              <button 
                style={{
                  backgroundColor: 'indianred', 
                  color: 'white', 
                  borderStyle: 'solid', 
                  borderColor: '#8B0000', 
                  borderWidth: '1px'
                }}
                className="py-2 px-4 rounded hover:bg-red-600 transition-colors"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </button>

              <DeleteModal
                isOpen={showDeleteModal}
                onCloseDelete={() => setShowDeleteModal(false)}
                onConfirmDelete={() => {
                  setShowDeleteModal(false);
                }}
              />
            </>

            <div className="space-x-4">

              <button 
                style={{
                  backgroundColor: "white",
                  color: 'black',
                  borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'
                }}
                className="py-2 px-4 rounded"
                onClick={() => setIsExpanded(false)}
              >
                {'Close'}
              </button>

              <button 
                style={{
                  backgroundColor: ButtonColorOption.ORANGE ,
                  color: 'black',
                  borderStyle: 'solid', borderColor: 'black', borderWidth: '1px'
                }}
                className="py-2 px-4 rounded"
                onClick={() => setShowNewGrantModal(true)}
              >
                {'Edit'}
              </button>

            </div>
            
          </div>

        {/*End expanded div */}
        </div> 
        )}
      </div>

      <div className="hidden-features">
          {showNewGrantModal && (
            <NewGrantModal 
              grant={curGrant}
              onClose={() => setShowNewGrantModal(false)} 
            />
          )}
        </div>


    </div>
  );
};

export default GrantItem;
