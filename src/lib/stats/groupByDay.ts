import type { ClosedSession, DayMinutes } from "./types";

export function groupByDay(sessions: Readonly<ClosedSession[]>): DayMinutes[] {
  const minutesByDate = new Map<string, number>();

  for (const session of sessions) {
    const minutes = minutesByDate.get(session.localDate) ?? 0;
    minutesByDate.set(session.localDate, minutes + session.durationMinutes);
  }

  const result = Array.from(minutesByDate, ([date, minutes]) => ({
    date,
    minutes,
  }));

  const sorted = result.toSorted((a, b) => a.date.localeCompare(b.date));
  return sorted;
}
