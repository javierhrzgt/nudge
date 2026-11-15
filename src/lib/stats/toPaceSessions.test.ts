import { describe, it, expect } from "vitest";
import { toPaceSessions } from "./toPaceSessions";
import type { ClosedSession } from "./types";
import { makeClosedSession, makeGoal } from "./testHelpers";

describe("toPaceSessions", () => {
  it("los minutos estimados de cada sesión son la suma de los estMinutes de sus metas", () => {
    const sessions: ClosedSession[] = [
      makeClosedSession(
        "s1",
        [
          makeGoal("g1", { estMinutes: 25 }),
          makeGoal("g2", { estMinutes: 10 }),
        ],
        { durationMinutes: 45 },
      ),
    ];

    const res = toPaceSessions(sessions);
    expect(res).toEqual([{ durationMinutes: 45, estimatedMinutes: 35 }]);
  });
  it("una sesión sin metas queda con 0 estimados", () => {
    const sessions: ClosedSession[] = [
      makeClosedSession("s1", [], { durationMinutes: 30 }),
    ];

    const res = toPaceSessions(sessions);
    expect(res).toEqual([{ durationMinutes: 30, estimatedMinutes: 0 }]);
  });
  it("la duración pasa tal cual", () => {
    const sessions: ClosedSession[] = [
      makeClosedSession(
        "s1",
        [
          makeGoal("g1", { estMinutes: 20 }),
          makeGoal("g2", { estMinutes: 10 }),
        ],
        { durationMinutes: 30 },
      ),
      makeClosedSession("s2", [makeGoal("g3", { estMinutes: 30 })], {
        durationMinutes: 20,
      }),
    ];

    const res = toPaceSessions(sessions);
    expect(res).toEqual([
      { durationMinutes: 30, estimatedMinutes: 30 },
      { durationMinutes: 20, estimatedMinutes: 30 },
    ]);
  });
  it("una lista vacía da una lista vacía", () => {
    const sessions: ClosedSession[] = [];

    const res = toPaceSessions(sessions);
    expect(res).toEqual([]);
  });
  it("mantiene el orden de las sesiones", () => {
    const sessions: ClosedSession[] = [
      makeClosedSession(
        "s2",
        [makeGoal("g3", { estMinutes: 45 }), makeGoal("g1", { estMinutes: 5 })],
        { durationMinutes: 30 },
      ),
      makeClosedSession(
        "s3",
        [
          makeGoal("g8", { estMinutes: 45 }),
          makeGoal("g5", { estMinutes: 25 }),
        ],
        { durationMinutes: 60 },
      ),
      makeClosedSession(
        "s1",
        [
          makeGoal("g4", { estMinutes: 15 }),
          makeGoal("g2", { estMinutes: 10 }),
        ],
        { durationMinutes: 20 },
      ),
    ];

    const res = toPaceSessions(sessions);
    expect(res).toEqual([
      { durationMinutes: 30, estimatedMinutes: 50 },
      { durationMinutes: 60, estimatedMinutes: 70 },
      { durationMinutes: 20, estimatedMinutes: 25 },
    ]);
  });
});
