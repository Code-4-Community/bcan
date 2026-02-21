import { useState } from "react";
import { downloadCsv, CsvColumn } from "../../utils/csvUtils";
import { Grant } from "../../../../middle-layer/types/Grant";
import { ProcessGrantData } from "../../main-page/grants/filter-bar/processGrantData";
import { observer } from "mobx-react-lite";
import { getAppStore } from "../../external/bcanSatchel/store";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import Attachment from "../../../../middle-layer/types/Attachment";
import POC from "../../../../middle-layer/types/POC";
import Button from "../settings/components/Button";
// Define the columns for the CSV export, including any necessary formatting.
const columns: CsvColumn<Grant>[] = [
  { key: "grantId", title: "Grant ID" },
  { key: "organization", title: "Organization" },
  {
    key: "does_bcan_qualify",
    title: "BCAN Qualifies?",
    formatValue: (value: boolean) =>
      value !== null ? (value ? "Yes" : "No") : "",
  },
  { key: "status", title: "Status" },
  {
    key: "amount",
    title: "Amount ($)",
    formatValue: (value: number) => (value ? value.toLocaleString() : ""),
  },
  {
    key: "grant_start_date",
    title: "Grant Start Date",
    formatValue: (value: string) =>
      value ? new Date(value).toLocaleDateString() : "",
  },
  {
    key: "application_deadline",
    title: "Application Deadline",
    formatValue: (value: string) =>
      value ? new Date(value).toLocaleDateString() : "",
  },
  {
    key: "report_deadlines",
    title: "Report Deadlines",
    formatValue: (value?: string[]) => (value?.length ? value.join(", ") : ""),
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
    formatValue: (value?: POC) =>
      value && value.POC_name && value.POC_email
        ? `${value.POC_name}${value.POC_email ? ` (${value.POC_email})` : ""}`
        : "",
  },
  {
    key: "bcan_poc",
    title: "BCAN POC",
    formatValue: (value: POC) =>
      value && value.POC_name && value.POC_email
        ? `${value.POC_name}${value.POC_email ? ` (${value.POC_email})` : ""}`
        : "",
  },
  {
    key: "attachments",
    title: "Attachments",
    formatValue: (attachments: Attachment[]) =>
      attachments?.length
        ? attachments
            .map((a) => a.url)
            .filter((u) => u)
            .join(" | ")
        : "",
  },
  {
    key: "isRestricted",
    title: "Restricted?",
    formatValue: (value: boolean) =>
      value !== null ? (value ? "Yes" : "No") : "",
  },
];

const CsvExportButton: React.FC = observer(() => {
  const { yearFilter } = getAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const { grants } = ProcessGrantData();
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
      `BCAN Data ${(yearFilter ?? []).join("_")} as of ${
        new Date().toISOString().split("T")[0]
      }`,
    );
    setIsProcessing(false);
  };

  return (
    <Button
      text={isProcessing ? "Exporting..." : "Export CSV"}
      onClick={onClickDownload}
      disabled={isProcessing}
      logo={faDownload}
      logoPosition="right"
      className="text-sm lg:text-base bg-white border-grey-500 flex justify-between items-center"
    />
  );
});

export default CsvExportButton;
