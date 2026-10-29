import type { AgendaDay, DayMark, Goal } from "./types";

export function getDayMarks(
  agenda: AgendaDay[],
  goals: Goal[],
): Record<string, DayMark> {
  const dayMarks: Record<string, DayMark> = {};
  agenda.forEach((day) => {
    if (day.goalIds.length > 0) {
      dayMarks[day.date] = "pending";
    }
  });
  goals.forEach((goal) => {
    if (goal.completedOn !== null) {
      const current = dayMarks[goal.completedOn];
      if (!current) {
        dayMarks[goal.completedOn] = "done";
      } else if (current === "pending") {
        dayMarks[goal.completedOn] = "partial";
      }
    }
  });
  return dayMarks;
}
