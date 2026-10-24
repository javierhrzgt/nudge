import { formatInTimeZone } from "date-fns-tz";
import type { OpenSession } from "./types";

export function activeDay(
  now: Date,
  timeZone: string,
  openSession: OpenSession | null,
): string {
  return formatInTimeZone(now, timeZone, "yyyy-MM-dd");
}
