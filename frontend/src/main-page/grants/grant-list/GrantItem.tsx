import React, { useEffect, useState } from "react";
import "../styles/GrantItem.css";
import { GrantAttributes } from "../grant-details/GrantAttributes";
import GrantDetails from "../grant-details/GrantDetails";
import StatusIndicator from "./StatusIndicator";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Grant } from "../../../../../middle-layer/types/Grant";
import { DoesBcanQualifyText } from "../../../translations/general";
import RingButton, { ButtonColorOption } from "../../../custom/RingButton";
import { Status } from "../../../../../middle-layer/types/Status";
import { api } from "../../../api";
import { MdOutlinePerson2 } from "react-icons/md";
import Attachment from "../../../../../middle-layer/types/Attachment";

interface GrantItemProps {
  grant: Grant;
  defaultExpanded?: boolean;
}

const GrantItem: React.FC<GrantItemProps> = ({ grant, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [curGrant, setCurGrant] = useState(grant);

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
        <li className="font-bold text-left flex items-center ">
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
        <div> 

          {/*div for the two columns above description*/}
          <div className="flex  mt-6 mb-6">

            {/*Left column */}
            <div className="w-1/2 px-3">

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
                        className="h-9  flex items-center justify-center w-full rounded-lg  px-4"
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
                          className="h-9 flex items-center justify-center w-full rounded-lg px-4"
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
                <div className="w-1/2 h-full px-3">
                  <label className="flex block tracking-wide text-gray-700 font-bold mb-2">
                    Report Deadlines
                  </label>
                  <div
                    className="p-2 rounded h-52 w-full"
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
                          className="h-10 flex items-center justify-center w-full rounded-lg mb-2 px-4"
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
            <div className="w-1/2 px-3"> 
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
                <div className="w-full">
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
                  <div className="w-1/2 pr-4 "> 

                    {/*Does BCAN qualify  */}
                    <div  className="w-full mb-3">
                      <label className="text-lg flex block tracking-wide text-gray-700 font-bold mb-1" htmlFor="grid-city">
                        Does BCAN qualify?
                      </label>  
                      <div 
                        style={{color: "black", 
                          backgroundColor: curGrant.does_bcan_qualify ? ButtonColorOption.GREEN : ButtonColorOption.GRAY}}
                        className="w-1/2 h-9 flex items-center justify-center rounded-lg  px-4"
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
                        className="w-1/2 h-9 flex items-center justify-center rounded-lg  px-4"
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
                        className="w-1/2 h-9 flex items-center justify-center rounded-lg  px-4"
                        >
                        {curGrant.isRestricted ? "Restricted" : "Not Restricted"}
                      </div>
                    </div>
                  {/*End colored attributes col*/}
                  </div>

                  {/*Scope documents div*/}
                  <div className="w-1/2">
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
                  {/*End report deadlines div*/}
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
              className=" h-48 bg-tan flex  w-full rounded-lg  px-4 "
              >
              {curGrant.description}
            </div>
          </div>

          {/*bottom buttons */}
          <div className="flex justify-between items-center w-full mt-6 mb-6" >
            <button 
              style={{backgroundColor: 'indianred', color: 'black'}}
              className="py-2 px-4 rounded"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this grant?')) {
                  // Add your delete logic here
                  console.log('Grant deleted');
                }
              }}
            >
              Delete
            </button>
            <button 
              style={{
                backgroundColor: isEditing ? ButtonColorOption.ORANGE : ButtonColorOption.GRAY, 
                color: 'black'
              }}
              className="py-2 px-4 rounded"
              onClick={toggleEdit}
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>

        {/*End expanded div */}
        </div> 
        )}
      </div>
    </div>
  );
};

export default GrantItem;
