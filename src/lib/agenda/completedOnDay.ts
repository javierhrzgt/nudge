import type { Goal } from "./types";

export function completedOnDay(activeDay: string, goals: Goal[]) {
  const goalsCompleted = goals.filter((goal) => goal.completedOn === activeDay);
  const totalMinutes = goalsCompleted.reduce(
    (acc, cur) => acc + cur.estMinutes,
    0,
  );
  return { completed: goalsCompleted.length, totalMinutes };
}
