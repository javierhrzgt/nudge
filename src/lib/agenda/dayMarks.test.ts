import { describe, it, expect } from "vitest";
import { getDayMarks } from "./dayMarks";
import { makeGoal } from "./testHelpers";
import type { AgendaDay, Goal } from "./types";

describe("getDayMarks", () => {
  it("Sin agenda ni metas completadas", () => {
    const agenda: AgendaDay[] = [];
    const goals: Goal[] = [];

    const res = getDayMarks(agenda, goals);
    expect(res).toEqual({});
  });
  it("Un día de la agenda con metas", () => {
    const agenda = [{ date: "2026-10-29", goalIds: ["g1", "g2", "g3", "g4"] }];
    const goals = [
      makeGoal("g1", { position: 1 }),
      makeGoal("g2", { position: 2 }),
      makeGoal("g3", { position: 3 }),
      makeGoal("g4", { position: 4 }),
    ];

    const res = getDayMarks(agenda, goals);
    expect(res).toEqual({ "2026-10-29": "pending" });
  });
  it("Una meta completada en una fecha que no está en la agenda", () => {
    const agenda: AgendaDay[] = [];
    const goals = [makeGoal("g1", { completedOn: "2026-10-28" })];

    const res = getDayMarks(agenda, goals);
    expect(res).toEqual({ "2026-10-28": "done" });
  });
  it("La misma fecha con metas completadas y metas asignadas", () => {
    const agenda = [{ date: "2026-10-28", goalIds: ["g2"] }];
    const goals = [
      makeGoal("g1", { completedOn: "2026-10-28" }),
      makeGoal("g2"),
    ];

    const res = getDayMarks(agenda, goals);
    expect(res).toEqual({ "2026-10-28": "partial" });
  });
  it("Varias metas completadas el mismo día", () => {
    const agenda: AgendaDay[] = [];
    const goals = [
      makeGoal("g1", { position: 1, completedOn: "2026-10-29" }),
      makeGoal("g2", { position: 2, completedOn: "2026-10-29" }),
      makeGoal("g3", { position: 3, completedOn: "2026-10-29" }),
    ];

    const res = getDayMarks(agenda, goals);
    expect(res).toEqual({ "2026-10-29": "done" });
  });
});
