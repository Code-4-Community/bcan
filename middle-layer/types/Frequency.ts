

export enum Frequency {
    Yearly = "Yearly",
    Monthly = "Monthly",
    OneTime = "One Time"
}

export const frequencyLabels = [
    { value: Frequency.Yearly, label: "/year" },
    { value: Frequency.Monthly, label: "/month" },
    { value: Frequency.OneTime, label: "" }
];

export function formatDateByFrequency(
  date: string | Date,
  frequency: Frequency
): string {
  const parsedDate = typeof date === "string" ? new Date(date + "T00:00:00") : new Date(date + "T00:00:00");

  if (isNaN(parsedDate.getTime())) return "";

  switch (frequency) {
    case Frequency.Yearly:
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
      }).format(parsedDate) + " " + getOrdinal(parsedDate.getDate());

    case Frequency.OneTime:
      return new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }).format(parsedDate);

    case Frequency.Monthly:
  return `the ${getOrdinal(parsedDate.getDate())}`;

    default:
      return "";
  }
}

function getOrdinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}