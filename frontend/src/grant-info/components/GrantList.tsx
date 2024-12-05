import React from 'react';
import CustomPagination from './CustomPagination';
import './styles/GrantList.css';
import { GrantItemProps } from './GrantItem';

const GrantList: React.FC = () => {
    const mockGrants: GrantItemProps[] = [
        { grantName: "Grant 1", applicationDate: "2024-01-15", generalStatus: "Pending", amount: 5000, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 2", applicationDate: "2024-02-10", generalStatus: "Approved", amount: 10000, restrictionStatus: "Restricted" },
        { grantName: "Grant 3", applicationDate: "2024-03-05", generalStatus: "Rejected", amount: 7000, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 4", applicationDate: "2024-04-20", generalStatus: "Approved", amount: 8500, restrictionStatus: "Restricted" },
        { grantName: "Grant 5", applicationDate: "2024-05-01", generalStatus: "Pending", amount: 12000, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 6", applicationDate: "2024-06-15", generalStatus: "Approved", amount: 6000, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 7", applicationDate: "2024-07-10", generalStatus: "Rejected", amount: 9500, restrictionStatus: "Restricted" },
        { grantName: "Grant 8", applicationDate: "2024-08-20", generalStatus: "Pending", amount: 7500, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 9", applicationDate: "2024-09-25", generalStatus: "Approved", amount: 11000, restrictionStatus: "Restricted" },
        { grantName: "Grant 10", applicationDate: "2024-10-30", generalStatus: "Rejected", amount: 4000, restrictionStatus: "Unrestricted" }
    ];

    return (
        <div className="grant-list">
            <CustomPagination grants={mockGrants} />
        </div>
    );
};

export default GrantList;