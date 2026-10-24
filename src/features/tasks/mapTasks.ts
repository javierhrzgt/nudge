import type { Task } from "../../lib/agenda/types";

interface GoalRow {
  id: string;
  est_minutes: number;
  position: number;
  completed_on: string | null;
}

interface TaskRow {
  id: string;
  position: number;
  goals: GoalRow[];
}

export function mapTasks(rows: TaskRow[]): Task[] {
  return rows.map((row) => ({
    id: row.id,
    position: row.position,
    goals: row.goals.map((goal) => ({
      id: goal.id,
      estMinutes: goal.est_minutes,
      position: goal.position,
      completedOn: goal.completed_on,
    })),
  }));
}
