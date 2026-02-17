import React from "react";

type InfoField = {
  label: string;
  value?: string | number | boolean;
  item?: React.ReactNode;
  important?: boolean;
};

type GrantFieldColProps = {
  fields: InfoField[];
  colspan?: 1 | 2;
};

export default function GrantFieldCol({
  fields,
  colspan = 1,
}: GrantFieldColProps) {
  return (
    <div
      className={
        `flex flex-col w-full gap-6 items-start text-left ` +
        (colspan === 2 ? "col-span-2" : "col-span-1")
      }
    >
      {fields.map((field) => (
        <div className="w-full" key={field.label}>
          <p className="text-grey-600 mb-1">{field.label}</p>
          <div className={`text-black ${field.important && "font-semibold"}`}>
            {field.item ? field.item : field.value || "N/A"}
          </div>
        </div>
      ))}
    </div>
  );
}
