import type { ClosedSession } from "../../lib/stats/types";

export interface SessionGoalRow {
  id: string;
  title: string;
  est_minutes: number;
}

export interface ClosedSessionRow {
  id: string;
  started_at: string;
  local_date: string;
  duration_minutes: number | null;
  goals: SessionGoalRow[];
}

export function mapClosedSessions(
  rows: Readonly<ClosedSessionRow[]>,
): ClosedSession[] {
  const filteredSessions = rows.flatMap((row) => {
    if (row.duration_minutes === null) {
      return [];
    }
    return [
      {
        id: row.id,
        startedAt: row.started_at,
        localDate: row.local_date,
        durationMinutes: row.duration_minutes,
        goals: row.goals.map((goal) => ({
          id: goal.id,
          title: goal.title,
          estMinutes: goal.est_minutes,
        })),
      },
    ];
  });

  return filteredSessions;
}
