import { useReducer, useState } from "react";
import Button from "../../../components/Button.tsx";
import { Grant } from "../../../../../middle-layer/types/Grant.ts";
import { observer } from "mobx-react-lite";
import { TDateISO } from "../../../../../backend/src/utils/date.ts";
import { Status } from "../../../../../middle-layer/types/Status.ts";
import Attachment from "../../../../../middle-layer/types/Attachment.ts";
import {
  createNewGrant,
  reducer,
  saveGrantEdits,
} from "./processGrantDataEditSave.ts";
import EditGrantDocuments from "./components/EditGrantDocuments.tsx";
import EditGrantContacts from "./components/EditGrantContacts.tsx";
import ErrorPopup from "./components/ErrorPopup.tsx";
import EditGrantInfo from "./components/EditGrantInfo.tsx";
import EditGrantHeader from "./components/EditGrantHeader.tsx";

export interface GrantFormState {
  organization: string;
  dueDate: TDateISO | "";
  applicationDate: TDateISO | "";
  grantStartDate: TDateISO | "";
  reportDates: (TDateISO | "")[];
  timeline: number | null;
  estimatedCompletionTime: number | null;
  doesBcanQualify: "yes" | "no" | "";
  isRestricted: "restricted" | "unrestricted" | "";
  status: Status;
  amount: number | null;
  description: string;
  attachments: Attachment[];
  bcanPocName: string;
  bcanPocEmail: string;
  grantProviderPocName: string;
  grantProviderPocEmail: string;
}

const EditGrant: React.FC<{
  grantToEdit: Grant | null;
  onClose: () => void;
}> = observer(({ grantToEdit, onClose }) => {
  // State to track if form was submitted successfully
  const [saving, setSaving] = useState(false);

  const [form, dispatch] = useReducer(reducer, {
    organization: grantToEdit?.organization ?? "",
    dueDate: grantToEdit?.application_deadline ?? "",
    applicationDate: grantToEdit?.application_deadline ?? "",
    grantStartDate: grantToEdit?.grant_start_date ?? "",
    reportDates: grantToEdit?.report_deadlines ?? [],
    timeline: grantToEdit?.timeline ?? null,
    estimatedCompletionTime: grantToEdit?.estimated_completion_time ?? null,
    doesBcanQualify: grantToEdit
      ? grantToEdit.does_bcan_qualify
        ? "yes"
        : "no"
      : "",
    isRestricted: grantToEdit
      ? grantToEdit.isRestricted
        ? "restricted"
        : "unrestricted"
      : "",
    status: grantToEdit?.status ?? Status.Inactive,
    amount: grantToEdit?.amount ?? null,
    description: grantToEdit?.description ?? "",
    attachments: grantToEdit?.attachments ?? [],
    bcanPocName: grantToEdit?.bcan_poc?.POC_name ?? "",
    bcanPocEmail: grantToEdit?.bcan_poc?.POC_email ?? "",
    grantProviderPocName: grantToEdit?.grantmaker_poc?.POC_name ?? "",
    grantProviderPocEmail: grantToEdit?.grantmaker_poc?.POC_email ?? "",
  });

  const validateInputs = (): string | null => {
    if (!form.organization.trim()) return "Organization Name is required";
    if (!form.status) return "Status is required";
    if (form.amount && form.amount <= 0) return "Amount must be greater than 0";
    if (!form.dueDate) return "Due Date is required";
    if (!form.grantStartDate) return "Grant Start Date is required";
    if (form.estimatedCompletionTime && form.estimatedCompletionTime <= 0) return "Estimated completion time must be greater than 0";
    if (!form.doesBcanQualify) return "BCAN eligibility is required";
    if(!form.reportDates.every((date) => date !== "")) return "Report deadlines must have a value";
    if (form.timeline && form.timeline <= 0) return "Timeline must be greater than 0";
    if (!form.bcanPocEmail) return "BCAN contact email required";
    if(!form.attachments.every((attachment) => attachment.url !== "")) return "Attachments must have a value";
    return null;
  };

  const buildGrant = (): Grant => ({
    grantId: grantToEdit?.grantId ?? 0,
    organization: form.organization,
    does_bcan_qualify: form.doesBcanQualify === "yes",
    amount: form.amount ?? 0,
    grant_start_date: form.grantStartDate as TDateISO,
    application_deadline: form.applicationDate as TDateISO,
    status: form.status as Status,
    report_deadlines: form.reportDates as TDateISO[],
    timeline: form.timeline ?? 0,
    estimated_completion_time: form.estimatedCompletionTime ?? 0,
    description: form.description,
    attachments: form.attachments,
    isRestricted: form.isRestricted === "restricted",
    bcan_poc: {
      POC_name: form.bcanPocName,
      POC_email: form.bcanPocEmail,
    },
    grantmaker_poc: {
      POC_name: form.grantProviderPocName,
      POC_email: form.grantProviderPocEmail,
    },
  });

  const [_errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const error = validateInputs();

    if (error) {
      setErrorMessage(error);
      setShowErrorPopup(true);
      setSaving(false);
      return;
    }

    const grantData = buildGrant();

    const result = grantToEdit
      ? await saveGrantEdits(grantData)
      : await createNewGrant(grantData);

    if (result.success) {
      setSaving(false);
      onClose();
    } else {
      setErrorMessage(result.error ?? "An error occurred");
      setShowErrorPopup(true);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col gap-6">
          {/* Header with Buttons */}
          <div className="flex justify-between items-start">
            <EditGrantHeader form={form} dispatch={dispatch} />
            <div className="flex gap-2">
              <Button
                text="Cancel"
                className="border-2 border-grey-500"
                onClick={onClose}
              />
              <Button
                text="Save"
                className="bg-primary-900 text-white px-3 py-1"
                onClick={handleSubmit}
                disabled={saving}
              />
            </div>
          </div>

          {/* Divider */}
          <hr className="border-grey-400 border-t-2 rounded-full" />

          {/* Description */}
          <EditGrantInfo form={form} dispatch={dispatch} />

          {/* Divider */}
          <hr className="border-grey-400 border-t-2 rounded-full" />

          {/* Contacts and Documents Section */}
          <div className="flex flex-col gap-4 items-start w-full">
            {/* Contacts */}
            <EditGrantContacts form={form} />
            {/* Documents */}
            <EditGrantDocuments />
          </div>
        </div>
      </div>
      {/* Error Popup */}
      {showErrorPopup && (
        <ErrorPopup
          message={_errorMessage}
          setShowErrorPopup={() => setShowErrorPopup(false)}
        />
      )}
    </div>
  );
});

export default EditGrant;
