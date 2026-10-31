import type { AgendaDay, Goal } from "./types";

export function dayDetail(day: string, agenda: AgendaDay[], goals: Goal[]) {
  const completed = goals.filter((goal) => goal.completedOn === day);

  const agendaDay = agenda.find((a) => a.date === day);
  const pendingIds = agendaDay?.goalIds ?? [];

  const pending = pendingIds.flatMap((id) => {
    const goalInfo = goals.find((goal) => goal.id === id);

    return goalInfo ? [goalInfo] : [];
  });

  return { goalsCompleted: completed, goalsPending: pending };
}
