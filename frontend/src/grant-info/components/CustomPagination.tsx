import React, { useState } from 'react';
import { Pagination } from '@mui/material';
import GrantItem, { GrantItemProps } from './GrantItem';

interface CustomPaginationProps {
    grants: GrantItemProps[];
}

const grantsPerPage = 3;

const CustomPagination: React.FC<CustomPaginationProps> = ({ grants }) => {

    const pageCount = Math.ceil(grants.length / grantsPerPage);

    const [pagination, setPagination] = useState({
        idxFrom: 0,
        idxTo: grantsPerPage - 1
    });

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        const idxFrom = (page - 1) * grantsPerPage;
        const idxTo = Math.min(idxFrom + grantsPerPage - 1, grants.length-1); // make sure no out of bounds
        setPagination({ idxFrom, idxTo });
    };


    console.log(`Current grant indices from: ${pagination.idxFrom} to ${pagination.idxTo}`);

    return (
        <div>
            {/* render grants based on actual indices */}
            {(() => {
                const renderedGrants = [];
                for (let i = pagination.idxFrom; i <= pagination.idxTo; i++) {
                    renderedGrants.push(
                        <GrantItem
                            key={i}
                            grantName={grants[i].grantName}
                            applicationDate={grants[i].applicationDate}
                            generalStatus={grants[i].generalStatus}
                            amount={grants[i].amount}
                            restrictionStatus={grants[i].restrictionStatus}
                        />
                    );
                }
                return renderedGrants;
            })()}

            {/* pagination controls */}
            <Pagination count={pageCount} onChange={handlePageChange}/>
        </div>
    );
};

export default CustomPagination;
