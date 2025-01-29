import React, {useState, useEffect } from 'react';
import './styles/GrantItem.css';
import { GrantAttributes } from './GrantAttributes';
import GrantDetails from './GrantDetails';
import {StatusContext} from './StatusContext';

// TODO: [JAN-14] Make uneditable field editable (ex: Description, Application Reqs, Additional Notes)
interface GrantItemProps {
    grantName: string;
    applicationDate: string;
    generalStatus: string;
    amount: number;
    restrictionStatus: string;
}
const GrantItem: React.FC<GrantItemProps> = (props) => {
    // will change back to const later once below is achieved.
   const { grantName, applicationDate, generalStatus, amount, restrictionStatus } = props;
    // NOTE: For now, generalStatus will be changed to demonstrate fetching from the database
    // Once Front-End display matches database schema, the query will actually be made in
    // GrantList.tsx. Furthermore, there is no established way for the front-end to know
    // which grant will be edited. Will default to GrantId: 1 for now as well.
   const [isExpanded, setIsExpanded] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [curStatus, setCurStatus] = useState(generalStatus);

   // NOTE: ^^this is also a placeholder for generalStatus

    // fetching initial status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const rawResponse = await fetch('http://localhost:3001/grant/1');
                if (rawResponse.ok) {
                    const data = await rawResponse.json();
                    setCurStatus(data.status);
                } else {
                    console.error('Failed to fetch grant status:', rawResponse.statusText);
                }
            } catch (err) {
                console.error('Error fetching status:', err);
            }
        };
        fetchStatus();
    }, []);

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
                <li className="grant-name">{grantName}</li>
                <li className="application-date">{applicationDate}</li>
                <li className="status">{curStatus}</li> {/*This is replacing generalStatus for now*/}
                <li className="amount">${amount}</li>
                <li className="restriction-status">{restrictionStatus}</li>
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