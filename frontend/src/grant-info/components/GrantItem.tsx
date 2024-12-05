import React, {useState} from 'react';
import './styles/GrantItem.css';

export interface GrantItemProps {
    grantName: string;
    applicationDate: string;
    generalStatus: string;
    amount: number;
    restrictionStatus: string;
}

const GrantItem: React.FC<GrantItemProps> = (props) => {
   const { grantName, applicationDate, generalStatus, amount, restrictionStatus } = props;

   const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        // class name with either be grant-item or grant-item-expanded
        <div className='grant-item-wrapper'>
            <ul className={`grant-summary ${isExpanded ? 'expanded' : ''}`} onClick={toggleExpand}>
                <li className="grant-name">{grantName}</li>
                <li className="application-date">{applicationDate}</li>
                <li className="status">{generalStatus}</li>
                <li className="amount">${amount}</li>
                <li className="restriction-status">{restrictionStatus}</li>
            </ul>
            <div className={`grant-body ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                    <div className="grant-description">
                        <h2>Grant Description:</h2>
                                <p>
                                    (Grant Description)
                                </p>
                        </div>
                    )}
            </div>

        </div>

    )
}

export default GrantItem;