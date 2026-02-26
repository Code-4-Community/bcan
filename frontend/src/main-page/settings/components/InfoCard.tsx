import type { ReactNode } from "react";

type InfoField = {
  label: string;
  value: string;
};

type InfoCardProps = {
  title?: string;
  fields: InfoField[];
  action?: ReactNode;
};

export default function InfoCard({ title, fields, action }: InfoCardProps) {
  return (
    <div className="w-full max-w-3xl rounded-md bg-white p-6 shadow-sm flex flex-col">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-xl font-bold flex justify-start">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 text-left">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-sm text-gray-500">{field.label}</p>
            <p className="text-base font-medium text-gray-900">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
