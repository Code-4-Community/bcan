import type { ReactNode } from "react";

type FieldLabelProps = {
  isRequired?: boolean;
  className?: string;
  children: ReactNode;
};

export default function FieldLabel({
  isRequired,
  className,
  children,
}: FieldLabelProps) {
  return (
    <label className={className}>
      {children}
      {isRequired && <span className="text-red ml-1">*</span>}
    </label>
  );
}
