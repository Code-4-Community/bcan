import React, {useState} from 'react';
import './styles/GrantItem.css';
import { GrantAttributes } from './GrantAttributes';
import GrantDetails from './GrantDetails';
import StatusIndicator from "./StatusIndicator";  // import the new component


function isActiveStatus(status: string) {
    return ["Pending", "In Review", "Awaiting Submission"].includes(status);
  }

interface GrantItemProps {
    grantName: string;
    applicationDate: string;
    generalStatus: string;
    amount: number;
    restrictionStatus: string;
}
const GrantItem: React.FC<GrantItemProps> = (props) => {
   const { grantName, applicationDate, generalStatus, amount, restrictionStatus } = props; 
   const [isExpanded, setIsExpanded] = useState(false);
   const [isEditing, setIsEditing] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    const toggleEdit = () => setIsEditing((prev) => !prev);
    const active = isActiveStatus(generalStatus);


    return (

        // class name with either be grant-item or grant-item-expanded
        <div className='grant-item-wrapper'>
            <ul className={`grant-summary ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpand}>
                <li className="grant-name">{grantName}</li>
                <li className="application-date">{applicationDate}</li>
                <li className="status">{generalStatus}</li>
                <li className="amount">${amount}</li>
                <li className="restriction-status">{restrictionStatus}</li>
                <li><StatusIndicator isActive={active} /></li>
            </ul>
            <div className={`grant-body ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                    <div className="grant-description">
                        <h2>Community Development Initiative Grant</h2>
                        <div className = 'grant-content'>
                        <GrantAttributes isEditing={isEditing} />
                        <GrantDetails/>
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