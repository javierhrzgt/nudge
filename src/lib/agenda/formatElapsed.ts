import { differenceInSeconds, parseISO } from "date-fns";

export function formatElapsed(now: Date, startedAt: string): string {
  const started = parseISO(startedAt);
  const seconds = Math.max(0, differenceInSeconds(now, started));

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}
