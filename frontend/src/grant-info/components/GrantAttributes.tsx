import React, { useContext} from 'react';
import './styles/GrantAttributes.css';
import {StatusContext} from './StatusContext.tsx';
interface GrantAttributesProps {
  isEditing: boolean;
}

export const GrantAttributes: React.FC<GrantAttributesProps> = ({isEditing}) => {

    // placeholder for now  before reworking, will remove redundant useState()
    const { curStatus, setCurStatus } = useContext(StatusContext);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurStatus(event.target.value);
    };

  return (
    <div className="grant-attributes">
      <div className="attribute-row">
        <div className="attribute-label">Status</div>
        {isEditing ? (
          <input
            type="text" /*This is also a place holder for updating the status*/
            className="attribute-value"
            value={curStatus}
            onChange={handleChange}
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
      <div className="attribute-row">
        <div className="attribute-label">Does BCAN qualify?</div>
        {isEditing ? (
          <input
            type="text"
            className="attribute-value"
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
      <div className="attribute-row">
        <div className="attribute-label">Deadline</div>
        {isEditing ? (
          <input
            type="text"
            className="attribute-value"
            name="deadline"
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
      <div className="attribute-row">
        <div className="attribute-label">Notification Date</div>
        {isEditing ? (
          <input
            type="text"
            className="attribute-value"
            name="notificationDate"
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
      <div className="attribute-row">
        <div className="attribute-label">Report Due:</div>
        {isEditing ? (
          <input
            type="text"
            className="attribute-value"
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
      <div className="attribute-row">
        <div className="attribute-label">Estimated Completion Time:</div>
        {isEditing ? (
          <input
            type="text"
            className="attribute-value"
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
      <div className="attribute-row">
        <div className="attribute-label">Scope Document:</div>
        {isEditing ? (
          <input
            type="text"
            className="attribute-value"
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
      <div className="attribute-row">
        <div className="attribute-label">Grantmaker POC:</div>
        {isEditing ? (
          <input
            type="text"
            className="attribute-value"
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
      <div className="attribute-row">
        <div className="attribute-label">Timeline:</div>
        {isEditing ? (
          <input
            type="text"
            className="attribute-value"
          />
        ) : (
          <span className="attribute-value"></span>
        )}
      </div>
    </div>
  );
};
