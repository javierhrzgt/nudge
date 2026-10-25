import { formatInTimeZone } from "date-fns-tz";
import type { OpenSession } from "./types";
import { isAbandoned } from "./isAbandoned";

export function activeDay(
  now: Date,
  timeZone: string,
  openSession: OpenSession | null,
): string {
  const today = formatInTimeZone(now, timeZone, "yyyy-MM-dd");
  if (openSession === null) {
    return today;
  }

  if (!isAbandoned(now, openSession)) {
    return openSession.localDate;
  } else {
    return today;
  }
}
