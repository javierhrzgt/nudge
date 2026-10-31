import { describe, it, expect } from "vitest";
import { dayDetail } from "./dayDetail";
import type { AgendaDay, Goal } from "./types";
import { makeGoal } from "./testHelpers";

describe("dayDetail", () => {
  it("Dia sin nada", () => {
    const day = "2026-10-29";
    const agenda: AgendaDay[] = [];
    const goals: Goal[] = [];

    const res = dayDetail(day, agenda, goals);
    expect(res).toEqual({ goalsCompleted: [], goalsPending: [] });
  });
  it("las pendientes salen en el orden de la agenda", () => {
    const day = "2026-10-29";
    const agenda: AgendaDay[] = [
      { date: "2026-10-29", goalIds: ["g2", "g1", "g4", "g3"] },
    ];
    const g1 = makeGoal("g1", { position: 1, estMinutes: 10 });
    const g2 = makeGoal("g2", { position: 2, estMinutes: 5 });
    const g3 = makeGoal("g3", { position: 3, estMinutes: 10 });
    const g4 = makeGoal("g4", { position: 4, estMinutes: 5 });
    const goals: Goal[] = [g1, g2, g3, g4];

    const res = dayDetail(day, agenda, goals);
    expect(res).toEqual({
      goalsCompleted: [],
      goalsPending: [g2, g1, g4, g3],
    });
  });
  it("Día con metas completadas ese día", () => {
    const day = "2026-10-29";
    const agenda: AgendaDay[] = [];
    const g1 = makeGoal("g1", {
      position: 1,
      estMinutes: 10,
      completedOn: "2026-10-29",
    });
    const g2 = makeGoal("g2", {
      position: 2,
      estMinutes: 5,
      completedOn: "2026-10-29",
    });
    const g3 = makeGoal("g3", {
      position: 3,
      estMinutes: 5,
      completedOn: "2026-10-28",
    });
    const goals: Goal[] = [g1, g2, g3];

    const res = dayDetail(day, agenda, goals);
    expect(res).toEqual({ goalsCompleted: [g1, g2], goalsPending: [] });
  });
  it("Día mixto: una completada y una pendiente a la vez", () => {
    const day = "2026-10-29";
    const agenda: AgendaDay[] = [{ date: "2026-10-29", goalIds: ["g2"] }];
    const g1 = makeGoal("g1", {
      position: 1,
      estMinutes: 10,
      completedOn: "2026-10-29",
    });
    const g2 = makeGoal("g2", {
      position: 2,
      estMinutes: 5,
    });
    const goals: Goal[] = [g1, g2];

    const res = dayDetail(day, agenda, goals);
    expect(res).toEqual({ goalsCompleted: [g1], goalsPending: [g2] });
  });
});
