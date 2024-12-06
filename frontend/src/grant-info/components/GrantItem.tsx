import React, {useState} from 'react';
import './styles/GrantItem.css';
import { FaArchive } from "react-icons/fa";

export interface GrantItemProps {
    grantName: string;
    grantBlurb: string;
    applicationDate: string;
    generalStatus: string;
    amount: number;
    restrictionStatus: string;
    is_archived?: boolean; /* Psuedo-feature (no backend impl merged yet, ask Ben for more info) */
}

const GrantItem: React.FC<GrantItemProps> = (props) => {
   const { grantName, grantBlurb, applicationDate, generalStatus, amount, restrictionStatus, is_archived } = props;

   const [isExpanded, setIsExpanded] = useState(false);
   const [isArchived, setIsArchived] = useState(props.is_archived)

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const setArchivedItem = () => {
      if (!isArchived) {
        toggleExpand();
      } 
      setIsArchived(!isArchived);
    }

    return (
        // class name with either be grant-item or grant-item-expanded
        <div className='grant-item-wrapper'>
            <ul className={`${isArchived ? 'grant-summary-archived' : 'grant-summary'} ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpand}>
                <li className="grant-name">{grantName}</li>
                <li className="application-date">{applicationDate}</li>
                <li className="status">{generalStatus}</li>
                <li className="amount">${amount}</li>
                <li className="restriction-status">{restrictionStatus}</li>
            </ul>
            <div className={`grant-body ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                    <div className={`${isArchived ? 'grant-description-archived' : 'grant-description'}`}>
                        <h2>Grant Description:</h2>
                                <p>
                                    {grantBlurb}
                                </p>
                                <button style={ {"marginBottom": 8}} onClick={setArchivedItem}><FaArchive/></button>
                        </div>
                    )}
            </div>

        </div>

    )
}

export default GrantItem;