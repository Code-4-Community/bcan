import React from 'react';
import './styles/GrantLabels.css'

const GrantLabels: React.FC = () => {
    return (
        <ul className="grant-labels">
            <li></li>
            <li className="grant-name">Grant Name</li>
            <li className="application-date">Application Date</li>
            <li className="status">Status</li>
            <li className="amount">Amount</li>
            <li className="restriction-status">Restricted vs. Unrestricted</li>
        </ul>
    )
}

export default GrantLabels;