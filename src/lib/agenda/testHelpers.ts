import type { Goal, Settings, Task } from "./types";

export function makeGoal(id: string, overrides: Partial<Goal> = {}): Goal {
  return {
    id,
    title: id,
    estMinutes: 30,
    position: 1,
    completedOn: null,
    ...overrides,
  };
}

export function makeTask(
  id: string,
  goals: Goal[],
  overrides: Partial<Task> = {},
): Task {
  return {
    id,
    position: 1,
    goals,
    ...overrides,
  };
}

export function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    workDays: [1, 3, 5],
    dailyMinutes: 30,
    startDate: "2026-10-26",
    ...overrides,
  };
}
