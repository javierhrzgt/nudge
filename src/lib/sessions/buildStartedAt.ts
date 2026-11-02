import { fromZonedTime } from "date-fns-tz";

interface BuildStartedAtParams {
  date: string | null;
  time: string | null;
  timezone: string;
}

export function buildStartedAt({
  date,
  time,
  timezone,
}: Readonly<BuildStartedAtParams>): Date | null {
  if (date === null || time === null) {
    return null;
  }

  return fromZonedTime(`${date}T${time}:00`, timezone);
}
