import React, { useState } from "react";
import { Grant } from "../../../../../../middle-layer/types/Grant";
import InputField from "../../../../components/InputField";
import Button from "../../../../components/Button";

interface CostBenefitAnalysisProps {
  grant: Grant;
}

interface CostBenefitResult {
  totalReportingCost: number;
  totalReportingTime: number;
  overhead: number;
  costPerReport: number;
  grantAmount: number;
}

export const CostBenefitAnalysis: React.FC<CostBenefitAnalysisProps> = ({
  grant,
}) => {
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [timePerReport, setTimePerReport] = useState<string>("");
  const [inputErrors, setInputErrors] = useState<{
    hourlyRate?: string;
    timePerReport?: string;
  }>({});
  const [costBenefitResult, setCostBenefitResult] =
    useState<CostBenefitResult | null>(null);

    const validatePositiveNumber = (
    value: string,
    fieldLabel: string,
  ): string | null => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return `${fieldLabel} is required.`;
    }

    // Require a full decimal number match to reject values like "2;0".
    if (!/^(?:\d+\.?\d*|\.\d+)$/.test(trimmedValue)) {
      return `${fieldLabel} must be a valid number.`;
    }

    const parsedValue = Number(trimmedValue);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return `${fieldLabel} must be greater than 0.`;
    }

    return null;
  };

  const calculateCostBenefit = () => {
    const hourlyRateError = validatePositiveNumber(hourlyRate, "Hourly rate");
    const timePerReportError = validatePositiveNumber(
      timePerReport,
      "Time per report",
    );

    const nextErrors = {
      hourlyRate: hourlyRateError ?? undefined,
      timePerReport: timePerReportError ?? undefined,
    };

    setInputErrors(nextErrors);

    if (hourlyRateError || timePerReportError) {
      setCostBenefitResult(null);
      return;
    }

    const rate = Number(hourlyRate.trim());
    const timeReport = Number(timePerReport.trim());

    const reportCount = grant.report_deadlines?.length ?? 0;
    const grantAmount = grant.amount;
    const estimatedTime = grant.estimated_completion_time | 5;

    console.log(
      "Grant values - Amount:",
      grantAmount,
      "EstTime:",
      estimatedTime,
      "ReportCount:",
      reportCount,
    );

    // Formula: NetBenefit = GrantAmount - ((EstimatedCompletionTime + ReportCount * TimePerReport) * StaffHourlyRate)
    const totalReportingCost = reportCount * timeReport * rate;

    const resultObj = {
      totalReportingCost: totalReportingCost,
      totalReportingTime: reportCount * timeReport,
      overhead: (totalReportingCost / grantAmount) * 100 || 0,
      costPerReport: totalReportingCost / reportCount || 0,
      grantAmount: grantAmount,
    };

    setCostBenefitResult(resultObj);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 lg:w-[85%] h-full">

      {/* Input form */}
      <div className="flex flex-col w-full gap-6 items-start text-left col-span-1">
        {/* Hourly Rate Input */}
        <div className="text-sm w-full">
          <InputField
            id="hourlyRate"
            label="Hourly Rate"
            placeholder="Enter rate"
            value={hourlyRate}
            inputMode="decimal"
            error={Boolean(inputErrors.hourlyRate)}
            onChange={(e) => {
              setHourlyRate(e.target.value);
              if (inputErrors.hourlyRate) {
                setInputErrors((previous) => ({ ...previous, hourlyRate: undefined }));
              }
            }}
          />
          {inputErrors.hourlyRate && (
            <p className="mt-1 text-xs text-red">{inputErrors.hourlyRate}</p>
          )}
        </div>

        {/* Time Per Report Input */}
        <div className="text-sm w-full">
          <InputField
            id="timePerReport"
            label="Time Per Report (hours)"
            placeholder="Enter time"
            value={timePerReport}
            inputMode="decimal"
            error={Boolean(inputErrors.timePerReport)}
            onChange={(e) => {
              setTimePerReport(e.target.value);
              if (inputErrors.timePerReport) {
                setInputErrors((previous) => ({ ...previous, timePerReport: undefined }));
              }
            }}
          />
          {inputErrors.timePerReport && (
            <p className="mt-1 text-xs text-red">{inputErrors.timePerReport}</p>
          )}
        </div>

        {/* Calculate Button */}
        <Button
          text="Calculate"
          onClick={calculateCostBenefit}
          disabled={!hourlyRate || !timePerReport}
          className="border-2 ml-auto bg-primary-900 text-white text-sm"
        />
      </div>

      {/* Shows the net benefit result */}
      <div className="flex flex-col w-full gap-4 items-start text-left col-span-1 xl:mt-7">
        {costBenefitResult && (
          <div className="flex flex-col w-full gap-3">
            <div className="text-center rounded-sm border-grey-400 border-2 p-4">
              <p className="text-gray-600 text-2xl font-bold">
                {formatCurrency(costBenefitResult.costPerReport)}
              </p>
              <p className="text-sm text-gray-600">Cost per report</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-gray-600">
                Total reporting cost:
                <span className="font-semibold ml-1">
                  {formatCurrency(costBenefitResult.totalReportingCost)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Total reporting time:
                <span className="font-semibold ml-1">
                  {new Intl.NumberFormat("en-US").format(
                    costBenefitResult.totalReportingTime,
                  )}{" "}
                  hours
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Overhead:
                <span className="font-semibold ml-1">
                  {costBenefitResult.overhead.toFixed(1)}% of{" "}
                  {formatCurrency(costBenefitResult.grantAmount)} grant
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
