import React, {useState } from 'react';
import './styles/GrantItem.css';
import { GrantAttributes } from './GrantAttributes';
import GrantDetails from './GrantDetails';
import {StatusContext} from './StatusContext';
import {Grant} from "@/external/bcanSatchel/store.ts";

interface GrantItemProps {
    grant: Grant;
}

// TODO: [JAN-14] Make uneditable field editable (ex: Description, Application Reqs, Additional Notes)
const GrantItem: React.FC<GrantItemProps> = ({grant}) => {


    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [curStatus, setCurStatus] = useState(grant.status);
   // NOTE: ^^this is also a placeholder for generalStatus


    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    // when toggleEdit gets saved, then updates the backend to update itself with whatever
    // is shown in the front-end

    const toggleEdit = async () => {
        if(isEditing) { // if you are saving
            try {
                const response = await fetch('http://localhost:3001/grant/save/status', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({status: curStatus}),
                });
                const result = await response.json();
                console.log(result);
            } catch(err) {
                console.error('Error saving data:', err);
            }
            // holding result for now
        }
        setIsEditing(!isEditing);
    };

    return (
        // class name with either be grant-item or grant-item-expanded
        <div className='grant-item-wrapper'>
            <ul className={`grant-summary ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpand}>
                <li className="grant-name">{grant.organization_name}</li>
                <li className="application-date">{"no attribute for app-date"}</li>
                <li className="status">{grant.status}</li>
                <li className="amount">${grant.amount}</li>
                <li className="restriction-status">{grant.restrictions}</li>
            </ul>
            <div className={`grant-body ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                    <div className="grant-description">
                        <h2>Community Development Initiative Grant</h2>
                        <div className = 'grant-content'>
                            <StatusContext.Provider value={{curStatus, setCurStatus}}>
                                <GrantAttributes isEditing={isEditing} />
                                <GrantDetails/>
                            </StatusContext.Provider>
                        </div>
                        <div className="bottom-buttons">
                        <button className="done-button" onClick={toggleEdit}>
                                {isEditing ? 'SAVE' : 'EDIT'}
                            </button>
                    </div>
                        </div>
                        
                    )}
            </div>

        </div>

    )
}

export default GrantItem;