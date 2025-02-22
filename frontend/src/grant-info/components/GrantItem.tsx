import React, {useState } from 'react';
import './styles/GrantItem.css';
import { GrantAttributes } from './GrantAttributes';
import GrantDetails from './GrantDetails';
import StatusIndicator from "./StatusIndicator";  // import the new component

function isActiveStatus(status: string) {
    return ["Pending", "In Review", "Awaiting Submission"].includes(status);
  }

import {Grant} from "@/external/bcanSatchel/store.ts";

interface GrantItemProps {
  grant: Grant;
}

// TODO: [JAN-14] Make uneditable field editable (ex: Description, Application Reqs, Additional Notes)
const GrantItem: React.FC<GrantItemProps> = ({ grant }) => {
  
  // when toggleEdit gets saved, then updates the backend to update itself with whatever
  // is shown in the front-end
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [curGrant,setCurGrant] = useState(grant);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
  
    const active = isActiveStatus(curGrant.status);

    // when toggle edit turns off, sends curGrant to backend to be saved
    const toggleEdit = async () => {
        if(isEditing) { // if you are saving
            try {
                console.log("Saving grant!");
                console.log(curGrant);
                const response = await fetch('http://localhost:3001/grant/save', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(curGrant),
                });
                const result = await response.json();
                console.log(result);
            } catch(err) {
                console.error('Error saving data:', err);
            }
        }
        setIsEditing(!isEditing);
    };

    // temporary buffer

    return (
        // class name with either be grant-item or grant-item-expanded
        <div className='grant-item-wrapper'>
            <ul className={`grant-summary ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpand}>
                <li className="grant-name">{curGrant.organization_name}</li>
                <li className="application-date">{"no attribute for app-date"}</li>
                <li className="status">{curGrant.status}</li>
                <li className="amount">${curGrant.amount}</li>
                <li className="restriction-status">{curGrant.restrictions}</li>
                <li><StatusIndicator isActive={active} /></li>
            </ul>
            <div className={`grant-body ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                    <div className="grant-description">
                        <h2>Community Development Initiative Grant</h2>
                        <div className = 'grant-content'>
                                <GrantAttributes curGrant={curGrant} setCurGrant={setCurGrant} isEditing={isEditing} />
                                <GrantDetails curGrant={curGrant} setCurGrant={setCurGrant} isEditing={isEditing} />
                        </div>
                        <div className="bottom-buttons">
                        <button className="done-button" onClick={toggleEdit}>
                                {isEditing ? 'SAVE' : 'EDIT'}
                            </button>
                    </div>
                        </div>
                        
                    )}
            </div>
            <div className="bottom-buttons">
              <button className="done-button" onClick={toggleEdit}>
                {isEditing ? "SAVE" : "EDIT"}
              </button>
            </div>
          </div>
    )};

export default GrantItem;
