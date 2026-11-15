import { describe, it, expect } from "vitest";
import type { ClosedSession } from "./types";
import { groupByDay } from "./groupByDay";
import { makeClosedSession } from "./testHelpers";

describe("groupByDay", () => {
  it("suma los minutos de dos sesiones del mismo día", () => {
    const sessions: ClosedSession[] = [
      makeClosedSession("s1", [], {
        startedAt: "2026-11-16T08:00:00Z",
        localDate: "2026-11-16",
        durationMinutes: 25,
      }),
      makeClosedSession("s2", [], {
        startedAt: "2026-11-16T12:00:00Z",
        localDate: "2026-11-16",
        durationMinutes: 40,
      }),
    ];

    const res = groupByDay(sessions);
    expect(res).toEqual([{ date: "2026-11-16", minutes: 65 }]);
  });
  it("separa las sesiones de días distintos", () => {
    const sessions: ClosedSession[] = [
      makeClosedSession("s3", [], {
        startedAt: "2026-11-10T08:00:00Z",
        localDate: "2026-11-10",
        durationMinutes: 15,
      }),
      makeClosedSession("s4", [], {
        startedAt: "2026-11-10T12:00:00Z",
        localDate: "2026-11-10",
        durationMinutes: 30,
      }),
      makeClosedSession("s2", [], {
        startedAt: "2026-11-16T12:00:00Z",
        localDate: "2026-11-16",
        durationMinutes: 40,
      }),
      makeClosedSession("s1", [], {
        startedAt: "2026-11-16T12:00:00Z",
        localDate: "2026-11-16",
        durationMinutes: 35,
      }),
    ];

    const res = groupByDay(sessions);
    expect(res).toEqual([
      { date: "2026-11-10", minutes: 45 },
      { date: "2026-11-16", minutes: 75 },
    ]);
  });
  it("ordena los días de la más antigua a la más reciente", () => {
    const sessions: ClosedSession[] = [
      makeClosedSession("s4", [], {
        startedAt: "2026-11-10T09:00:00Z",
        localDate: "2026-11-10",
        durationMinutes: 15,
      }),
      makeClosedSession("s2", [], {
        startedAt: "2026-11-16T13:00:00Z",
        localDate: "2026-11-16",
        durationMinutes: 40,
      }),
      makeClosedSession("s3", [], {
        startedAt: "2026-11-12T14:00:00Z",
        localDate: "2026-11-12",
        durationMinutes: 30,
      }),
      makeClosedSession("s1", [], {
        startedAt: "2026-11-17T19:00:00Z",
        localDate: "2026-11-17",
        durationMinutes: 35,
      }),
    ];

    const res = groupByDay(sessions);
    expect(res).toEqual([
      { date: "2026-11-10", minutes: 15 },
      { date: "2026-11-12", minutes: 30 },
      { date: "2026-11-16", minutes: 40 },
      { date: "2026-11-17", minutes: 35 },
    ]);
  });
  it("devuelve un arreglo vacío sin sesiones", () => {
    const sessions: ClosedSession[] = [];

    const res = groupByDay(sessions);
    expect(res).toEqual([]);
  });
});
