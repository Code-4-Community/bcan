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
        className="cost-benefit-container p-1 rounded-lg h-full flex flex-col"
        style={{
          backgroundColor: 'white'
        }}
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
            className="w-full h-[42px]  px-3 py-4 border border-black rounded-md bg-tan placeholder-gray-500"
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
            className="w-full h-[42px] px-3 py-4 border border-black rounded-md bg-tan placeholder-gray-500"
          />
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateNetBenefit}
          className="w-full py-1 px-4 rounded-md mb-7 bg-primary-800"
          style={{
            color: 'black',
            borderStyle: 'solid',
            borderColor: 'black',
            borderWidth: '1px'
          }}
        >
          calculate
        </button>

        {/* Analysis Button - Shows the net benefit result */}
        <div className="flex justify-end items-center gap-2">
            <span className="text-sm font-semibold"> Net Benefit:</span>
        <div
          onClick={calculateNetBenefit}
          className="w-1/2 py-2 px-4 rounded-md bg-tan"
          style={{
            color: netBenefit !== null ? 'black' : 'gray',
            borderStyle: 'solid',
            borderColor: 'black',
            borderWidth: '1px',
            overflow: 'auto',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {netBenefit !== null ? formatCurrency(netBenefit) : 'Analysis'}
        </div>
        </div>
      </div>
    </div>
  );
};