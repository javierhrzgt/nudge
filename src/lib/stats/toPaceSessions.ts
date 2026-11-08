import type { ClosedSession, PaceSession } from "./types";

export function toPaceSessions(
  sessions: Readonly<ClosedSession[]>,
): PaceSession[] {
  const mappedSessions = sessions.map((session) => {
    const estimatedMinutes = session.goals.reduce(
      (prev, curr) => prev + curr.estMinutes,
      0,
    );

    return { durationMinutes: session.durationMinutes, estimatedMinutes };
  });
  return mappedSessions;
}
