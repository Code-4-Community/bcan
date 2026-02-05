import React, { useState } from 'react';
import { Grant } from '../../../../../middle-layer/types/Grant';
import '../styles/CostBenefitAnalysis.css';

interface CostBenefitAnalysisProps {
  grant: Grant;
}

export const CostBenefitAnalysis: React.FC<CostBenefitAnalysisProps> = ({ grant }) => {
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [timePerReport, setTimePerReport] = useState<string>('');
  const [netBenefit, setNetBenefit] = useState<number | null>(null);

  const calculateNetBenefit = () => {
    console.log('Called calculate')
    console.log('hourlyRate state:', hourlyRate)
    console.log('timePerReport state:', timePerReport)
    const rate = parseFloat(hourlyRate);
    const timeReport = parseFloat(timePerReport);

    console.log('Parsed rate:', rate)
    console.log('Parsed timeReport:', timeReport)

    // Validation
    if (isNaN(rate) || isNaN(timeReport) || rate <= 0 || timeReport <= 0) {
      alert('Please enter valid positive numbers for hourly rate and time per report.');
      return;
    }

    const reportCount = grant.report_deadlines?.length ?? 0;
    const grantAmount = grant.amount;
    const estimatedTime = grant.estimated_completion_time | 5;

    console.log('Grant values - Amount:', grantAmount, 'EstTime:', estimatedTime, 'ReportCount:', reportCount);

    // Formula: NetBenefit = GrantAmount - ((EstimatedCompletionTime + ReportCount * TimePerReport) * StaffHourlyRate)
    const result = grantAmount - ((estimatedTime + reportCount * timeReport) * rate);
    
    console.log('Final result:', result);

    setNetBenefit(result);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="cost-benefit-analysis">
      <label className="text-lg flex block tracking-wide text-gray-700 font-semibold text-left">
        Cost Benefit Analysis
      </label>
      
      <div 
        className="cost-benefit-container p-1 rounded-lg h-full flex flex-col bg-white"
      >
        {/* Hourly Rate Input */}
        <div className="mb-3">
          <label className="block text-left text-gray-700 text-sm mb-1">
            Hourly rate
          </label>
          <input
            type="number"
            placeholder="Enter rate"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full h-[42px]  px-3 py-4 border border-gray-400 rounded-md bg-[#F2EBE4]"
          />
        </div>

        {/* Time Per Report Input */}
        <div className="mb-3">
          <label className="block text-left text-gray-700 text-sm mb-1">
            Time per report (in hours)
          </label>
          <input
            type="number"
            placeholder="Enter time"
            value={timePerReport}
            onChange={(e) => {
                console.log('Time per report changed to:', e.target.value);
                setTimePerReport(e.target.value);
            }}
            className="w-full h-[42px] px-3 py-4 border border-gray-400 rounded-md bg-[#F2EBE4]"
          />
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateNetBenefit}
          className="w-full py-1 px-4 rounded-md mb-7 bg-[#F58D5C] text-black border border-black"
        >
          calculate
        </button>

        {/* Analysis Button - Shows the net benefit result */}
        <div className="flex justify-end items-center gap-2">
            <span className="text-sm font-semibold"> Net Benefit:</span>
        <div
          onClick={calculateNetBenefit}
          className={`w-1/2 py-2 px-4 rounded-md bg-[#F2EBE4] border border-black overflow-auto text-center whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] ${
            netBenefit !== null ? 'text-black' : 'text-gray-500'
          }`}
        >
          {netBenefit !== null ? formatCurrency(netBenefit) : 'Analysis'}
        </div>
        </div>
      </div>
    </div>
  );
};