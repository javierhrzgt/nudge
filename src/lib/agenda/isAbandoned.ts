import { differenceInMinutes, parseISO } from "date-fns";
import type { OpenSession } from "./types";

export const ABANDONED_AFTER_HOURS = 6;

export function isAbandoned(now: Date, openSession: OpenSession): boolean {
  const duration =
    differenceInMinutes(now, parseISO(openSession.startedAt)) / 60;

  return duration > ABANDONED_AFTER_HOURS;
}
