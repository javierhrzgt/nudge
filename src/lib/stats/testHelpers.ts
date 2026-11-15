import type { ClosedSession, PaceSession, SessionGoal } from "./types";

export function makeSession(overrides: Partial<PaceSession> = {}): PaceSession {
  return {
    durationMinutes: 10,
    estimatedMinutes: 10,
    ...overrides,
  };
}

export function makeClosedSession(
  id: string,
  goals: SessionGoal[],
  overrides: Partial<ClosedSession> = {},
): ClosedSession {
  return {
    id,
    startedAt: "2026-11-08T00:00:00Z",
    localDate: "2026-11-07",
    durationMinutes: 10,
    goals,
    ...overrides,
  };
}

export function makeGoal(
  id: string,
  overrides: Partial<SessionGoal> = {},
): SessionGoal {
  return {
    id,
    title: id,
    estMinutes: 10,
    ...overrides,
  };
}
