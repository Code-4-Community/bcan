import React from 'react';
import './styles/GrantAttributes.css';
import { Grant } from '../../../../middle-layer/types/Grant';

interface GrantAttributesProps {
  isEditing: boolean;
  curGrant: Grant;
  setCurGrant: React.Dispatch<React.SetStateAction<Grant>>;
}

export const GrantAttributes: React.FC<GrantAttributesProps> = ({curGrant, setCurGrant, isEditing}) => {

    // placeholder for now  before reworking, will remove redundant useState()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;

        // only modifies the changed field
        setCurGrant(curGrant => ({
            ...curGrant,
            [name]: value
        }));
    };

    return (
        <div className="grant-attributes bg-medium-orange">
            <div className="attribute-row">
                <div className="attribute-label">Status</div>
                <input
                    type="text"
                    name="status"
                    className="attribute-value"
                    value={curGrant.status}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
            </div>
            <div className="attribute-row">
                <div className="attribute-label">Does BCAN qualify?</div>
                <input
                    type="text"
                    className="attribute-value"
                    name="is_bcan_qualifying"
                    value={curGrant.does_bcan_qualify ? "Yes" : "No"}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
            </div>
            <div className="attribute-row">
                <div className="attribute-label">Deadline</div>
                <input
                    type="text"
                    className="attribute-value"
                    name="deadline"
                    value={curGrant.application_deadline}
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
            </div>
            <div className="attribute-row">
                <div className="attribute-label">Notification Date</div>
                <input
                    type="text"
                    className="attribute-value"
                    name="notificationDate"
                    readOnly={!isEditing}
                />
            </div>
            <div className="attribute-row">
                <div className="attribute-label">Report Due:</div>
                <input
                    type="text"
                    className="attribute-value"
                    readOnly={!isEditing}
                />
            </div>
            <div className="attribute-row">
                <div className="attribute-label">Estimated Completion Time:</div>
                <input
                    type="text"
                    className="attribute-value"
                    readOnly={!isEditing}
                />
            </div>
            <div className="attribute-row">
                <div className="attribute-label">Scope Document:</div>
                <input
                    type="text"
                    className="attribute-value"
                    readOnly={!isEditing}
                />
            </div>
            <div className="attribute-row">
                <div className="attribute-label">Grantmaker POC:</div>
                <input
                    type="text"
                    className="attribute-value"
                    name="point_of_contacts"
                    value={curGrant.grantmaker_poc.POC_name} // placeholder, will need to change
                    onChange={handleChange}
                    readOnly={!isEditing}
                />
            </div>
            <div className="attribute-row">
                <div className="attribute-label">Timeline:</div>
                <input
                    type="text"
                    className="attribute-value"
                    readOnly={!isEditing}
                />
            </div>
        </div>
    );
};
