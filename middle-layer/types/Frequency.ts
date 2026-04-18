

export enum Frequency {
    Yearly = "Yearly",
    Monthly = "Monthly",
    OneTime = "One Time",
    Custom = "Custom"
}

export const frequencyLabels = [
    { value: Frequency.Yearly, label: "/year" },
    { value: Frequency.Monthly, label: "/month" },
    { value: Frequency.OneTime, label: "" },
    { value: Frequency.Custom, label: "" }
];

export const frequencyIntervalsInMonths: Record<Frequency, number> = {
    [Frequency.Yearly]: 12,
    [Frequency.Monthly]: 1,
    [Frequency.OneTime]: 0,
    [Frequency.Custom]: 0, // Interval is determined by the user for recurring costs
};

export function formatDateByFrequency(
  date: string | Date,
  frequency: Frequency,
  interval: number
): string {
  const parsedDate = typeof date === "string" ? new Date(date + "T00:00:00") : new Date(date + "T00:00:00");

  if (isNaN(parsedDate.getTime())) return "";

  switch (frequency) {

    case Frequency.OneTime:
      return "on " + new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      }).format(parsedDate);

    case Frequency.Custom:
      return `every ${interval} month${interval > 1 ? "s" : ""} starting ` + new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      }).format(parsedDate);

    default:
      return "starting " + new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      }).format(parsedDate);
  }
}