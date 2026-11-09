import { describe, it, expect } from "vitest";
import {
  mapClosedSessions,
  type ClosedSessionRow,
  type SessionGoalRow,
} from "./mapClosedSessions";

function makeSessionGoalRow(
  id: string,
  overrides: Partial<SessionGoalRow> = {},
): SessionGoalRow {
  return {
    id,
    title: id,
    est_minutes: 30,
    ...overrides,
  };
}

function makeSessionRow(
  id: string,
  goals: SessionGoalRow[],
  overrides: Partial<ClosedSessionRow> = {},
): ClosedSessionRow {
  return {
    id,
    started_at: "2026-11-08T12:00:00Z",
    local_date: "2026-11-08",
    duration_minutes: 20,
    goals,
    ...overrides,
  };
}

describe("mapClosedSessions", () => {
  it("traduce los nombres de columna de cada fila a los de ClosedSession", () => {
    const sessions: ClosedSessionRow[] = [
      makeSessionRow("s1", [makeSessionGoalRow("g1")]),
    ];
    const res = mapClosedSessions(sessions);

    expect(res).toEqual([
      {
        id: "s1",
        startedAt: "2026-11-08T12:00:00Z",
        localDate: "2026-11-08",
        durationMinutes: 20,
        goals: [
          {
            id: "g1",
            title: "g1",
            estMinutes: 30,
          },
        ],
      },
    ]);
  });
  it("traduce est_minutes a estMinutes en las metas de cada sesión", () => {
    const sessions: ClosedSessionRow[] = [
      makeSessionRow("s1", [
        makeSessionGoalRow("g1"),
        makeSessionGoalRow("g2", { est_minutes: 45 }),
      ]),
    ];
    const res = mapClosedSessions(sessions);

    expect(res).toEqual([
      {
        id: "s1",
        startedAt: "2026-11-08T12:00:00Z",
        localDate: "2026-11-08",
        durationMinutes: 20,
        goals: [
          {
            id: "g1",
            title: "g1",
            estMinutes: 30,
          },
          {
            id: "g2",
            title: "g2",
            estMinutes: 45,
          },
        ],
      },
    ]);
  });
  it("una sesión sin metas queda con la lista de metas vacía", () => {
    const sessions: ClosedSessionRow[] = [makeSessionRow("s1", [])];
    const res = mapClosedSessions(sessions);

    expect(res).toEqual([
      {
        id: "s1",
        startedAt: "2026-11-08T12:00:00Z",
        localDate: "2026-11-08",
        durationMinutes: 20,
        goals: [],
      },
    ]);
  });
  it("omite las filas sin duración", () => {
    const sessions: ClosedSessionRow[] = [
      makeSessionRow("s1", [makeSessionGoalRow("g1")]),
      makeSessionRow("s2", [makeSessionGoalRow("g4")], {
        duration_minutes: null,
      }),
    ];
    const res = mapClosedSessions(sessions);

    expect(res).toEqual([
      {
        id: "s1",
        startedAt: "2026-11-08T12:00:00Z",
        localDate: "2026-11-08",
        durationMinutes: 20,
        goals: [
          {
            id: "g1",
            title: "g1",
            estMinutes: 30,
          },
        ],
      },
    ]);
  });
  it("mantiene el orden de las filas", () => {
    const sessions: ClosedSessionRow[] = [
      makeSessionRow(
        "s2",
        [
          makeSessionGoalRow("g1"),
          makeSessionGoalRow("g6", { est_minutes: 10 }),
          makeSessionGoalRow("g41", { est_minutes: 50 }),
        ],
        { duration_minutes: 50, started_at: "2026-11-08T10:00:00Z" },
      ),
      makeSessionRow(
        "s1",
        [
          makeSessionGoalRow("g10"),
          makeSessionGoalRow("g3", { est_minutes: 5 }),
          makeSessionGoalRow("g14", { est_minutes: 15 }),
        ],
        { duration_minutes: 45, started_at: "2026-11-08T08:00:00Z" },
      ),
      makeSessionRow(
        "s3",
        [
          makeSessionGoalRow("g2"),
          makeSessionGoalRow("g20", { est_minutes: 50 }),
          makeSessionGoalRow("g4", { est_minutes: 1 }),
        ],
        { duration_minutes: 60, started_at: "2026-11-08T19:00:00Z" },
      ),
    ];
    const res = mapClosedSessions(sessions);

    expect(res).toEqual([
      {
        id: "s2",
        startedAt: "2026-11-08T10:00:00Z",
        localDate: "2026-11-08",
        durationMinutes: 50,
        goals: [
          {
            id: "g1",
            title: "g1",
            estMinutes: 30,
          },
          {
            id: "g6",
            title: "g6",
            estMinutes: 10,
          },
          {
            id: "g41",
            title: "g41",
            estMinutes: 50,
          },
        ],
      },
      {
        id: "s1",
        startedAt: "2026-11-08T08:00:00Z",
        localDate: "2026-11-08",
        durationMinutes: 45,
        goals: [
          {
            id: "g10",
            title: "g10",
            estMinutes: 30,
          },
          {
            id: "g3",
            title: "g3",
            estMinutes: 5,
          },
          {
            id: "g14",
            title: "g14",
            estMinutes: 15,
          },
        ],
      },
      {
        id: "s3",
        startedAt: "2026-11-08T19:00:00Z",
        localDate: "2026-11-08",
        durationMinutes: 60,
        goals: [
          {
            id: "g2",
            title: "g2",
            estMinutes: 30,
          },
          {
            id: "g20",
            title: "g20",
            estMinutes: 50,
          },
          {
            id: "g4",
            title: "g4",
            estMinutes: 1,
          },
        ],
      },
    ]);
  });
});
