// Meant to replace GrantItem.tsx when we implement new design

import React from "react";
import { Grant } from "../../../../../middle-layer/types/Grant";
import StatusIndicator from "./StatusIndicator";

interface GrantCardProps {
  grant: Grant;
  isSelected: boolean;
  onClick?: () => void;
}

const GrantCard: React.FC<GrantCardProps> = ({ grant, isSelected, onClick }) => {

  const formattedDate = new Date(grant.application_deadline).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });

  return (
    <div
      onClick={onClick}
      className={`
        relative w-[100%] h-fit flex-shrink-0 rounded-2xl p-2 lg:p-4 mb-3 cursor-pointer bg-white 
        flex flex-col lg:flex-row justify-between items-center
        ${isSelected ? 'border-2 border-secondary-500' : 'border border-grey-200'}
        hover:shadow-md
      `}
    >
      {/* Colored left border indicator + Grant Name + Amount*/}
      <div className="h-full w-[85%] lg:w-[55%] flex flex-row gap-3 py-4">
        <div 
          className="relative group w-[5px] min-w-[5px] h-full rounded-full flex-shrink-0" 
          style={{ backgroundColor: grant.does_bcan_qualify ? "var(--color-green)" : "var(--color-red-dark)" }}
        >
          {/* Eligibility Badge - Shows on hover over the line */}
          <div className={`
            absolute -top-6 -left-6 px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap
            opacity-0 group-hover:opacity-100 transition-opacity z-10
            ${grant.does_bcan_qualify 
              ? 'bg-green-light text-green-dark' 
              : 'bg-red-light text-red-dark'
            }
          `}>
            {grant.does_bcan_qualify ? 'Eligible' : 'Not Eligible'}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="text-lg font-semibold text-gray-900 lg:truncate text-left">
            {grant.organization}
          </div>
          <div className="text-md font-medium text-gray-900 text-left">
            ${grant.amount}
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="h-full w-[85%] lg:w-[40%] flex flex-col justify-between items-end pb-4 lg:pb-0">
        <span className="text-md text-gray-600 text-right">
          Due: <span className="font-semibold">{formattedDate}</span>
        </span>
        <StatusIndicator curStatus={grant.status} />
      </div>
    </div>
  );
};

export default GrantCard;
