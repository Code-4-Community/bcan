import React from 'react';
import './styles/GrantDetails.css';
import { Grant } from '../../../../middle-layer/types/Grant';

interface GrantDetailsProps {
    isEditing: boolean;
    curGrant: Grant;
    setCurGrant: React.Dispatch<React.SetStateAction<Grant>>;
}

const GrantDetails: React.FC<GrantDetailsProps> = ({isEditing, curGrant, setCurGrant})  => {


    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = event.target;

        // only modifies the changed field
        setCurGrant(curGrant =>({
            ...curGrant,
            [name]: value
        }));
    };


    return (
        <div className="grant-details">
            <h3>Description</h3>
            <textarea
                className="attribute-value large-textarea bg-white"
                name="description"
                value={curGrant.description}
                onChange={handleChange}
                readOnly={!isEditing}
            />
            <h3>Application Requirements</h3>
            <textarea
                className="attribute-value large-textarea"
                name="reporting_requirements"
                value={curGrant.description}
                onChange={handleChange}
                readOnly={!isEditing}
            />
            <h3>Additional Notes</h3>
            <textarea
                className="attribute-value large-textarea"
                name="attached_resources"
                value={curGrant.description}
                onChange={handleChange}
                readOnly={!isEditing}
            />
        </div>
    );
}

export default GrantDetails;
