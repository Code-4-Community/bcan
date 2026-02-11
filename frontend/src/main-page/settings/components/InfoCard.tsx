type InfoField = {
  label: string;
  value: string;
};

type InfoCardProps = {
  title?: string;
  fields: InfoField[];
};

export default function InfoCard({ title, fields }: InfoCardProps) {
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-sm flex flex-col">
      {title && (
        <h2 className="mb-4 text-lg font-bold flex justify-start">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-2 gap-4 text-left">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs text-gray-500">{field.label}</p>
            <p className="text-sm font-medium text-gray-900">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
