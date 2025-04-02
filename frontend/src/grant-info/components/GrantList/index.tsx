import "../styles/GrantList.css";
import { observer } from "mobx-react-lite";
import GrantItem from "../GrantItem";
import GrantLabels from "../GrantLabels";
import {
    PaginationRoot,
    PaginationPrevTrigger,
    PaginationNextTrigger,
    PaginationItems,
    PaginationPageText,
} from "../Pagination";
import { ProcessGrantData } from "./processGrantData.ts";
import CalendarDropdown from "./CalendarDropdown.tsx";

// displays main grant list
const GrantList: React.FC = observer(() => {
    const { grants, onSort, totalPages } = ProcessGrantData();

    return (
        <div className="paginated-grant-list">
            <PaginationRoot defaultPage={1} count={totalPages}>
                <div style={{display: "flex", justifyContent: "flex-start"}}>
                    <CalendarDropdown/>
                </div>
                <GrantLabels onSort={onSort}/>
                <div className="grant-list p-4">
                    {grants.map(grant => (
                        <GrantItem key={grant.grantId} grant={grant}/>
                    ))}
                </div>
                <div className="pagination-controls m-4">
                    <PaginationPrevTrigger/>
                    <PaginationItems/>
                    <PaginationNextTrigger/>
                    <PaginationPageText format="compact"/>
                </div>
            </PaginationRoot>
        </div>
    );
});

export default GrantList;