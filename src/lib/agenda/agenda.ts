import type { AgendaDay, Goal, Settings } from "./types";
import { parseISO, addDays, format, getDay } from "date-fns";

function nextWorkDay(from: Date, workDays: number[]): Date {
  let date = from;
  while (!workDays.includes(getDay(date))) {
    date = addDays(date, 1);
  }

  return date;
}

export function generarAgenda(goals: Goal[], settings: Settings): AgendaDay[] {
  if (settings.workDays.length === 0)
    throw new Error(`No hay días laborales seleccionados`);
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
  let cursor = nextWorkDay(startDate, settings.workDays);
  const result: AgendaDay[] = [];
  for (const ids of days) {
    result.push({ date: format(cursor, "yyyy-MM-dd"), goalIds: ids });
    cursor = nextWorkDay(addDays(cursor, 1), settings.workDays);
  }
  return result;
}
