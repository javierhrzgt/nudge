import type { AgendaDay, Goal, Settings, Task } from "./types";
import { parseISO, addDays, format, getDay, max } from "date-fns";

function nextWorkDay(from: Date, workDays: number[]): Date {
  let date = from;
  while (!workDays.includes(getDay(date))) {
    date = addDays(date, 1);
  }

  return date;
}

function groupIntoDays(
  goals: Goal[],
  dailyMinutes: number,
  firstDayBudget: number,
): string[][] {
  const days: string[][] = [];
  let currentDay: string[] = [];
  let currentMinutes = 0;
  let limit = firstDayBudget;

  for (const goal of goals) {
    if (
      currentMinutes + goal.estMinutes > limit &&
      (currentDay.length > 0 || limit < dailyMinutes)
    ) {
      days.push(currentDay);
      currentDay = [];
      currentMinutes = 0;
      limit = dailyMinutes;
    }
    currentDay.push(goal.id);
    currentMinutes += goal.estMinutes;
  }
  if (currentDay.length > 0) {
    days.push(currentDay);
  }

  return days;
}

export function generarAgenda(
  tasks: Task[],
  settings: Settings,
  activeDay: string,
): AgendaDay[] {
  if (settings.workDays.length === 0)
    throw new Error(`No hay días laborales seleccionados`);

  const startDate = max([parseISO(settings.startDate), parseISO(activeDay)]);
  let cursor = nextWorkDay(startDate, settings.workDays);
  const cursorIsToday = format(cursor, "yyyy-MM-dd") === activeDay;
  const result: AgendaDay[] = [];
  const sortedTasks = tasks.toSorted((a, b) => a.position - b.position);

  const goals = tasks.flatMap((t) => t.goals);
  const goalsCompleted = goals.filter((g) => g.completedOn === activeDay);

  const minutesCompleted = goalsCompleted.reduce(
    (acc, cur) => acc + cur.estMinutes,
    0,
  );

  let firstDayBudget = cursorIsToday
    ? settings.dailyMinutes - minutesCompleted
    : settings.dailyMinutes;

  if (cursorIsToday && firstDayBudget <= 0) {
    cursor = nextWorkDay(addDays(cursor, 1), settings.workDays);
    firstDayBudget = settings.dailyMinutes;
  }

  for (const task of sortedTasks) {
    const pending = task.goals.filter((g) => g.completedOn === null);
    const sortedGoals = pending.toSorted((a, b) => a.position - b.position);
    const days = groupIntoDays(
      sortedGoals,
      settings.dailyMinutes,
      firstDayBudget,
    );

    if (days.length > 0) {
      firstDayBudget = settings.dailyMinutes;
    }

    for (const ids of days) {
      if (ids.length > 0) {
        result.push({ date: format(cursor, "yyyy-MM-dd"), goalIds: ids });
      }
      cursor = nextWorkDay(addDays(cursor, 1), settings.workDays);
    }
  }
  return result;
}
