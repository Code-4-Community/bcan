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
  deleteGrant
} from "./processGrantDataEditSave.ts";
import EditGrantContacts from "./components/EditGrantContacts.tsx";
import ErrorPopup from "./components/ErrorPopup.tsx";
import EditGrantInfo from "./components/EditGrantInfo.tsx";
import EditGrantHeader from "./components/EditGrantHeader.tsx";
import { EditGrantDocuments } from "./components/EditGrantDocuments.tsx";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import ActionConfirmation from "../../../components/ActionConfirmation.tsx";

export interface GrantFormState {
  organization: string;
  applicationDate: TDateISO | "";
  applicationDeadline: TDateISO | "";
  grantStartDate: TDateISO | "";
  reportDates: (TDateISO | "")[];
  timeline: number;
  estimatedCompletionTime: number;
  doesBcanQualify: "yes" | "no" | "";
  isRestricted: "restricted" | "unrestricted" | "";
  status: Status;
  amount: number;
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
  onGrantCreated?: (grantId: number) => void;
}> = observer(({ grantToEdit, onClose, onGrantCreated }) => {
  // State to track if form was submitted successfully
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [form, dispatch] = useReducer(reducer, {
    organization: grantToEdit?.organization ?? "",
    applicationDate: grantToEdit?.application_date ?? "",
    applicationDeadline: grantToEdit?.application_deadline ?? "",
    grantStartDate: grantToEdit?.grant_start_date ?? "",
    reportDates: grantToEdit?.report_deadlines ?? [],
    timeline: grantToEdit?.timeline ?? 0,
    estimatedCompletionTime: grantToEdit?.estimated_completion_time ?? 0,
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
    amount: grantToEdit?.amount ?? 0,
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
    if (form.amount == null || form.amount <= 0) return "Amount must be greater than 0";
    if (!form.applicationDeadline) return "Due Date is required";
    if (
      form.applicationDate &&
      new Date(form.applicationDate).getTime() >
        new Date(form.applicationDeadline).getTime()
    ) {
      return "Application Date cannot be after Due Date";
    }
    if (!form.grantStartDate) return "Grant Start Date is required";
    if (
      new Date(form.grantStartDate).getTime() <
        new Date(form.applicationDeadline).getTime()
    ) {
      return "Grant Start Date cannot be before Due Date";
    }
    if (!form.estimatedCompletionTime || form.estimatedCompletionTime <= 0) return "Estimated completion time must be greater than 0";
    if (!form.doesBcanQualify) return "BCAN eligibility is required";
    if(form.reportDates.length > 0 && !form.reportDates.every((date) => date !== "")) return "Report deadlines must have a value";
    if (!form.timeline || form.timeline <= 0) return "Timeline must be greater than 0";
    if (!form.bcanPocEmail) return "BCAN contact required";
    if (!form.grantProviderPocEmail) return "Grant provider contact required";
    if(form.attachments.length > 0 && !form.attachments.every((attachment) => attachment.url !== "")) return "Attachments must have a value";
    return null;
  };

  const buildGrant = (): Grant => ({
    grantId: grantToEdit?.grantId ?? 0,
    organization: form.organization,
    does_bcan_qualify: form.doesBcanQualify === "yes",
    amount: form.amount ?? 0,
    grant_start_date: form.grantStartDate as TDateISO,
    application_deadline: form.applicationDeadline as TDateISO,
    application_date: form.applicationDate as TDateISO,
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

  const handleDelete = async () => {
    setShowDeleteModal(false);
    deleteGrant(grantToEdit?.grantId)
    onClose();
  }

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
    console.log(grantData)

    const result = grantToEdit
      ? await saveGrantEdits(grantData)
      : await createNewGrant(grantData);

    if (result.success) {
      if (!grantToEdit && result.grantId != null) {
        onGrantCreated?.(result.grantId);
      }
      setSaving(false);
      onClose();
    } else {
      setErrorMessage(result.error ?? "An error occurred");
      setShowErrorPopup(true);
      setSaving(false);
    }
    
  };

  const handleSaveClick = () => {
    const error = validateInputs();

    if (error) {
      setErrorMessage(error);
      setShowSaveModal(false);
      setShowErrorPopup(true);
      return;
    }

    setShowErrorPopup(false);
    setShowSaveModal(true);
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
                onClick={handleSaveClick}
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
            {/* Contacts */}
            <EditGrantContacts form={form} dispatch={dispatch} />
            {/* Documents */}
            <EditGrantDocuments form={form} dispatch={dispatch} />  

          {/* Divider */}
          {grantToEdit && (<div>
          <hr className="border-grey-400 border-t-2 rounded-full" />
          <Button text="Delete Grant" logo={faTrash} logoPosition="right" className="w-fit mt-6 ml-auto text-red active:!bg-red active:!border-red hover:border-red bg-red-light" onClick={() => setShowDeleteModal(true)}/>
          <ActionConfirmation
                      isOpen={showDeleteModal}
                      onCloseDelete={() => setShowDeleteModal(false)}
                      onConfirmDelete={() => {
                        handleDelete();
                      }}
                      title="Delete Grant"
                      subtitle={"Are you sure you want to delete"}
                      boldSubtitle={form.organization}
                      warningMessage="If you delete this grant, it will be permanently removed from the system."
                      variant="delete"
                    />
          </div>)}
          <ActionConfirmation
            isOpen={showSaveModal}
            onCloseDelete={() => setShowSaveModal(false)}
            onConfirmDelete={() => {
              handleSubmit();
            }}
            title={grantToEdit ? "Save Grant" : "Create Grant"}
            subtitle={
              grantToEdit
                ? "Are you sure you want to save changes to"
                : "Are you sure you want to create a grant for"
            }
            boldSubtitle={form.organization}
            warningMessage={
              grantToEdit
                ? "Saving will update this grant's details in the system."
                : "A new grant will be added to the system with these details."
            }
            variant={grantToEdit ? "update" : "create"}
          />
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
