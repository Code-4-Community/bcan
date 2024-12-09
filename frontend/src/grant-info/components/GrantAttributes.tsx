import React from 'react';
import './styles/GrantAttributes.css';

export const GrantAttributes: React.FC = () => {
    return(
            <div className="grant-attributes">
        <div className="attribute-row">
            <div className="attribute-label">Status</div>
            <input type="text" className="attribute-value" />
        </div>
        <div className="attribute-row">
            <div className="attribute-label">Deadline</div>
            <input type="text" className="attribute-value" />
        </div>
        <div className="attribute-row">
            <div className="attribute-label">Notification Date</div>
            <input type="text" className="attribute-value" />
        </div>
    </div>

    );
}