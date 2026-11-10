import type { PaceSession, Totals } from "./types";

export function calculateTotals(sessions: Readonly<PaceSession[]>): Totals {
  const realMinutes = sessions.reduce(
    (prev, curr) => prev + curr.durationMinutes,
    0,
  );

  const estimatedMinutes = sessions.reduce(
    (prev, curr) => prev + curr.estimatedMinutes,
    0,
  );

  return { realMinutes, estimatedMinutes };
}
