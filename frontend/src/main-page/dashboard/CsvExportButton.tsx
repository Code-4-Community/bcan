import { useState } from "react";
import { downloadCsv, CsvColumn } from "../../utils/csvUtils";
import { Grant } from "../../../../middle-layer/types/Grant";
import { useProcessGrantData } from "../../main-page/grants/filter-bar/processGrantData";
import { observer } from "mobx-react-lite";
import "../grants/styles/GrantButton.css";
import { getAppStore } from "../../external/bcanSatchel/store";

// Define the columns for the CSV export, including any necessary formatting.
const columns: CsvColumn<Grant>[] = [
  { key: "grantId", title: "Grant ID" },
  { key: "organization", title: "Organization" },
  {
    key: "does_bcan_qualify",
    title: "BCAN Qualifies",
    formatValue: (value: boolean) => (value ? "Yes" : "No"),
  },
  { key: "status", title: "Status" },
  {
    key: "amount",
    title: "Amount ($)",
    formatValue: (value: number) => value.toLocaleString(),
  },
  {
    key: "grant_start_date",
    title: "Grant Start Date",
    formatValue: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: "application_deadline",
    title: "Application Deadline",
    formatValue: (value: string) => new Date(value).toLocaleDateString(),
  },
  {
    key: "report_deadlines",
    title: "Report Deadlines",
    formatValue: (value?: string[]) =>
      value?.length ? value.join(", ") : "None",
  },
  {
    key: "description",
    title: "Description",
    formatValue: (value?: string) => value ?? "",
  },
  { key: "timeline", title: "Timeline (Years)" },
  {
    key: "estimated_completion_time",
    title: "Estimated Completion Time (Hours)",
  },
  {
    key: "grantmaker_poc",
    title: "Grantmaker POC",
    formatValue: (value?: { POC_name: string; POC_email: string }) =>
      value
        ? `${value.POC_name}${value.POC_email ? ` (${value.POC_email})` : ""}`
        : "N/A",
  },
  {
    key: "bcan_poc",
    title: "BCAN POC",
    formatValue: (value: { POC_name: string; POC_email: string }) =>
      `${value.POC_name}${value.POC_email ? ` (${value.POC_email})` : ""}`,
  },
  {
    key: "attachments",
    title: "Attachments",
    formatValue: (attachments: string[]) =>
      attachments?.length ? attachments.join(" | ") : "None",
  },
  {
    key: "isRestricted",
    title: "Restricted?",
    formatValue: (value: boolean) => (value ? "Yes" : "No"),
  },
];

const CsvExportButton: React.FC = observer(() => {
  const {yearFilter } = getAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const { grants } = useProcessGrantData();
  const onClickDownload = async () => {
    setIsProcessing(true);

    const data = grants as Grant[];

    // Optional: handle empty or invalid data gracefully
    if (!data || data.length === 0) {
      alert("No data available to export.");
      setIsProcessing(false);
      return;
    }

    // Simulate delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    downloadCsv(
      data,
      columns,
      `BCAN Data ${(yearFilter ?? []).join("_")} as of ${new Date().toISOString().split("T")[0]}`
    );
    setIsProcessing(false);
  };

  return (
    <button
      className="grant-button add-grant-button bg-medium-orange"
      type="button"
      onClick={onClickDownload}
      disabled={isProcessing}
      title="Export the grants data including any applied filters."
    >
      {isProcessing ? "Please wait..." : "Export CSV"}
    </button>
  );
});

export default CsvExportButton;
