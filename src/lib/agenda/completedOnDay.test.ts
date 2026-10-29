import { describe, it, expect } from "vitest";
import { completedOnDay } from "./completedOnDay";
import { makeGoal } from "./testHelpers";
import type { Goal } from "./types";

describe("completedOnDay", () => {
  it("no hay metas", () => {
    const date = "2026-10-28";
    const goals: Goal[] = [];
    const res = completedOnDay(date, goals);
    expect(res).toEqual({ completed: 0, totalMinutes: 0 });
  });
  it("metas completadas otro día o sin completar no cuentan", () => {
    const date = "2026-10-28";
    const goals = [
      makeGoal("g1", { completedOn: "2026-10-27" }),
      makeGoal("g2"),
    ];

    const res = completedOnDay(date, goals);
    expect(res).toEqual({ completed: 0, totalMinutes: 0 });
  });
  it("dos metas completadas el día pedido", () => {
    const date = "2026-10-28";
    const goals = [
      makeGoal("g1", { completedOn: "2026-10-28", estMinutes: 25 }),
      makeGoal("g2", { completedOn: "2026-10-28", estMinutes: 30 }),
      makeGoal("g2", { estMinutes: 20 }),
    ];

    const res = completedOnDay(date, goals);
    expect(res).toEqual({ completed: 2, totalMinutes: 55 });
  });
});
