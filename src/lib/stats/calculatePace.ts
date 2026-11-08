import type { PaceSession } from "./types";

export function calculatePace(
  sessions: Readonly<PaceSession[]>,
): number | null {
  const filteredSessions = sessions.filter(
    (session) => session.estimatedMinutes > 0,
  );

  if (filteredSessions.length === 0) {
    return null;
  }

  const minutesReal = filteredSessions.reduce(
    (prev, curr) => prev + curr.durationMinutes,
    0,
  );
  const minutesEst = filteredSessions.reduce(
    (prev, curr) => prev + curr.estimatedMinutes,
    0,
  );

  return minutesReal / minutesEst;
}
