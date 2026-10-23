import type { AgendaDay, Goal, Settings, Task } from "./types";
import { parseISO, addDays, format, getDay } from "date-fns";

function nextWorkDay(from: Date, workDays: number[]): Date {
  let date = from;
  while (!workDays.includes(getDay(date))) {
    date = addDays(date, 1);
  }

  return date;
}

function groupIntoDays(goals: Goal[], dailyMinutes: number): string[][] {
  const days: string[][] = [];
  let currentDay: string[] = [];
  let currentMinutes = 0;

  for (const goal of goals) {
    if (
      currentDay.length > 0 &&
      currentMinutes + goal.estMinutes > dailyMinutes
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

  return days;
}

export function generarAgenda(tasks: Task[], settings: Settings): AgendaDay[] {
  if (settings.workDays.length === 0)
    throw new Error(`No hay días laborales seleccionados`);

  const startDate = parseISO(settings.startDate);
  let cursor = nextWorkDay(startDate, settings.workDays);
  const result: AgendaDay[] = [];
  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  for (const task of sortedTasks) {
    const pending = task.goals.filter((g) => g.completedOn === null);
    const days = groupIntoDays(pending, settings.dailyMinutes);
    for (const ids of days) {
      result.push({ date: format(cursor, "yyyy-MM-dd"), goalIds: ids });
      cursor = nextWorkDay(addDays(cursor, 1), settings.workDays);
    }
  }
  return result;
}
