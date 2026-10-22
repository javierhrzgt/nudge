import type { AgendaDay, Goal, Settings } from "./types";
import { parseISO, addDays, format } from "date-fns";

export function generarAgenda(goals: Goal[], settings: Settings): AgendaDay[] {
  const days: string[][] = [];
  let currentDay: string[] = [];
  let currentMinutes = 0;

  for (const goal of goals) {
    if (
      currentDay.length > 0 &&
      currentMinutes + goal.estMinutes > settings.dailyMinutes
    ) {
      days.push(currentDay);
      currentDay = [];
      currentMinutes = 0;
    }
    currentDay.push(goal.id);
    currentMinutes += goal.estMinutes;
  }
  if (currentDay.length > 0) {
    days.push(currentDay);
  }

  const startDate = parseISO(settings.startDate);
  const agenda = days.map((ids, index) => {
    const date = format(addDays(startDate, index), "yyyy-MM-dd");
    return { date, goalIds: ids };
  });
  return agenda;
}
