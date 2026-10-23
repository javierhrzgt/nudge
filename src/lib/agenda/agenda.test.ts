import { describe, it, expect } from "vitest";
import { generarAgenda } from "./agenda";
import type { Goal, Settings } from "./types";

function makeGoal(id: string, overrides: Partial<Goal> = {}): Goal {
  return {
    id,
    taskId: "t1",
    estMinutes: 30,
    position: 1,
    completedOn: null,
    ...overrides,
  };
}

describe("generarAgenda", () => {
  it("reparte metas de una tarea según los minutos diarios", () => {
    const goals: Goal[] = [
      makeGoal("g1", { position: 1 }),
      makeGoal("g2", { position: 2 }),
      makeGoal("g3", { position: 3 }),
      makeGoal("g4", { position: 4 }),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(goals, settings);

    expect(result).toEqual([
      { date: "2026-10-26", goalIds: ["g1", "g2"] },
      { date: "2026-10-27", goalIds: ["g3", "g4"] },
    ]);
  });

  it("salta los dias que no son de trabajo", () => {
    const goals: Goal[] = [
      makeGoal("g1", { position: 1 }),
      makeGoal("g2", { position: 2 }),
      makeGoal("g3", { position: 3 }),
      makeGoal("g4", { position: 4 }),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-30",
    };

    const result = generarAgenda(goals, settings);

    expect(result).toEqual([
      { date: "2026-10-30", goalIds: ["g1", "g2"] },
      { date: "2026-11-02", goalIds: ["g3", "g4"] },
    ]);
  });

  it("si startDate no es laborable, empieza el siguiente día laboral", () => {
    const goals: Goal[] = [
      makeGoal("g1", { position: 1 }),
      makeGoal("g2", { position: 2 }),
      makeGoal("g3", { position: 3 }),
      makeGoal("g4", { position: 4 }),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-31",
    };

    const result = generarAgenda(goals, settings);

    expect(result).toEqual([
      { date: "2026-11-02", goalIds: ["g1", "g2"] },
      { date: "2026-11-03", goalIds: ["g3", "g4"] },
    ]);
  });
  it("valida que workDays no sea vacío []", () => {
    const goals: Goal[] = [makeGoal("g1", { position: 1 })];
    const settings: Settings = {
      workDays: [],
      dailyMinutes: 60,
      startDate: "2026-10-31",
    };

    expect(() => generarAgenda(goals, settings)).toThrow("días laborales");
  });
  it("ignora las metas ya completadas", () => {
    const goals: Goal[] = [
      makeGoal("g1", { position: 1, completedOn: "2026-10-20" }),
      makeGoal("g2", { position: 2 }),
      makeGoal("g3", { position: 3 }),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(goals, settings);

    expect(result).toEqual([{ date: "2026-10-26", goalIds: ["g2", "g3"] }]);
  });
});
