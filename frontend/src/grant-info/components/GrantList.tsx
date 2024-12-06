import React from 'react';
import CustomPagination from './CustomPagination';
import './styles/GrantList.css';
import { GrantItemProps } from './GrantItem';

const GrantList: React.FC = () => {
    const mockGrants: GrantItemProps[] = [
        { grantName: "Grant 1: Mogan Roses Grant", grantBlurb: "The Mogan Roses grant provides organizations the oppurtunity to speak their mind in a virtual townhall to the city of Boston. If 35%+ of our viewership agrees with your proposals, we fund them!", applicationDate: "2024-01-15", generalStatus: "Pending", amount: 5000, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 2: Healey's Q2 Proposal", grantBlurb: "N/A", applicationDate: "2024-02-10", generalStatus: "Approved", amount: 10000, restrictionStatus: "Restricted" },
        { grantName: "Grant 3: Found this online, not sure", grantBlurb: "N/A", applicationDate: "2024-03-05", generalStatus: "Rejected", amount: 7000, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 4: MassDOT Gas Recall", grantBlurb: "N/A", applicationDate: "2024-04-20", generalStatus: "Approved", amount: 8500, restrictionStatus: "Restricted" },
        { grantName: "Grant 5: Big Dig 2", grantBlurb: "N/A", applicationDate: "2024-05-01", generalStatus: "Pending", amount: 1200000000, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 6: Dawn Lights on Marble", grantBlurb: "N/A", applicationDate: "2024-06-15", generalStatus: "Approved", amount: 6000, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 7: Framingham Fritters", grantBlurb: "N/A", applicationDate: "2024-07-10", generalStatus: "Rejected", amount: 9500, restrictionStatus: "Restricted" },
        { grantName: "Grant 8: Quantum Carbon Sensing Fund", grantBlurb: "N/A", applicationDate: "2024-08-20", generalStatus: "Pending", amount: 7500, restrictionStatus: "Unrestricted" },
        { grantName: "Grant 9: Boston University Cares", grantBlurb: "N/A", applicationDate: "2024-09-25", generalStatus: "Approved", amount: 11000, restrictionStatus: "Restricted" },
        { grantName: "Grant 10: Northeastern University Clears", grantBlurb: "N/A", applicationDate: "2024-10-30", generalStatus: "Rejected", amount: 4000, restrictionStatus: "Unrestricted" }
    ];

    return (
        <div className="grant-list">
            <CustomPagination grants={mockGrants} />
        </div>
    );
};

export default GrantList;