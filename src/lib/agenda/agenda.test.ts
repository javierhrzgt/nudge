import { describe, it, expect } from "vitest";
import { generarAgenda } from "./agenda";
import type { Goal, Settings } from "./types";

describe("generarAgenda", () => {
  it("reparte metas de una tarea según los minutos diarios", () => {
    const goals: Goal[] = [
      {
        id: "g1",
        taskId: "t1",
        estMinutes: 30,
        position: 1,
        completedOn: null,
      },
      {
        id: "g2",
        taskId: "t1",
        estMinutes: 30,
        position: 2,
        completedOn: null,
      },
      {
        id: "g3",
        taskId: "t1",
        estMinutes: 30,
        position: 3,
        completedOn: null,
      },
      {
        id: "g4",
        taskId: "t1",
        estMinutes: 30,
        position: 4,
        completedOn: null,
      },
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
      {
        id: "g1",
        taskId: "t1",
        estMinutes: 30,
        position: 1,
        completedOn: null,
      },
      {
        id: "g2",
        taskId: "t1",
        estMinutes: 30,
        position: 2,
        completedOn: null,
      },
      {
        id: "g3",
        taskId: "t1",
        estMinutes: 30,
        position: 3,
        completedOn: null,
      },
      {
        id: "g4",
        taskId: "t1",
        estMinutes: 30,
        position: 4,
        completedOn: null,
      },
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
});
