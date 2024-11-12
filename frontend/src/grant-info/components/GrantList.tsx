import React from 'react';
import GrantItem from './GrantItem';
import './styles/GrantList.css'

const GrantList: React.FC = () => {
    const singleGrantData = {
        grantName: "Community Development Grant",
        applicationDate: "2024-09-15",
        generalStatus: "Approved",
        amount: 50000,
        restrictionStatus: "Unrestricted"
    };

    return (
        <div className="grant-list">
            <GrantItem{...singleGrantData}/>
            <GrantItem{...singleGrantData}/>
            <GrantItem{...singleGrantData}/>
        </div>
    )
}

export default GrantList;