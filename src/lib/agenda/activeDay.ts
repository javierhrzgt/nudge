import { formatInTimeZone } from "date-fns-tz";
import type { OpenSession } from "./types";
import { differenceInMinutes, parseISO } from "date-fns";

export const ABANDONED_AFTER_HOURS = 6;

export function activeDay(
  now: Date,
  timeZone: string,
  openSession: OpenSession | null,
): string {
  const today = formatInTimeZone(now, timeZone, "yyyy-MM-dd");
  if (openSession === null) {
    return today;
  }

  const activeSessionHours =
    differenceInMinutes(now, parseISO(openSession.startedAt)) / 60;

  if (activeSessionHours <= ABANDONED_AFTER_HOURS) {
    return openSession.localDate;
  } else {
    return today;
  }
}
