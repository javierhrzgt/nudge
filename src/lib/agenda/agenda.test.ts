import { describe, it, expect } from "vitest";
import { generarAgenda } from "./agenda";
import type { Goal, Settings, Task } from "./types";

const PAST_DAY = "2000-01-01";

function makeGoal(id: string, overrides: Partial<Goal> = {}): Goal {
  return {
    id,
    estMinutes: 30,
    position: 1,
    completedOn: null,
    ...overrides,
  };
}

function makeTask(
  id: string,
  goals: Goal[],
  overrides: Partial<Task> = {},
): Task {
  return {
    id,
    position: 1,
    goals,
    ...overrides,
  };
}

describe("generarAgenda", () => {
  it("reparte metas de una tarea según los minutos diarios", () => {
    const tasks: Task[] = [
      makeTask("t1", [
        makeGoal("g1", { position: 1 }),
        makeGoal("g2", { position: 2 }),
        makeGoal("g3", { position: 3 }),
        makeGoal("g4", { position: 4 }),
      ]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([
      { date: "2026-10-26", goalIds: ["g1", "g2"] },
      { date: "2026-10-27", goalIds: ["g3", "g4"] },
    ]);
  });

  it("salta los dias que no son de trabajo", () => {
    const tasks: Task[] = [
      makeTask("t1", [
        makeGoal("g1", { position: 1 }),
        makeGoal("g2", { position: 2 }),
        makeGoal("g3", { position: 3 }),
        makeGoal("g4", { position: 4 }),
      ]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-30",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([
      { date: "2026-10-30", goalIds: ["g1", "g2"] },
      { date: "2026-11-02", goalIds: ["g3", "g4"] },
    ]);
  });

  it("si startDate no es laborable, empieza el siguiente día laboral", () => {
    const tasks: Task[] = [
      makeTask("t1", [
        makeGoal("g1", { position: 1 }),
        makeGoal("g2", { position: 2 }),
        makeGoal("g3", { position: 3 }),
        makeGoal("g4", { position: 4 }),
      ]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-31",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([
      { date: "2026-11-02", goalIds: ["g1", "g2"] },
      { date: "2026-11-03", goalIds: ["g3", "g4"] },
    ]);
  });
  it("valida que workDays no sea vacío []", () => {
    const tasks: Task[] = [makeTask("t1", [makeGoal("g1", { position: 1 })])];
    const settings: Settings = {
      workDays: [],
      dailyMinutes: 60,
      startDate: "2026-10-31",
    };

    expect(() => generarAgenda(tasks, settings, PAST_DAY)).toThrow(
      "días laborales",
    );
  });
  it("ignora las metas ya completadas", () => {
    const tasks: Task[] = [
      makeTask("t1", [
        makeGoal("g1", { position: 1, completedOn: "2026-10-20" }),
        makeGoal("g2", { position: 2 }),
        makeGoal("g3", { position: 3 }),
      ]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([{ date: "2026-10-26", goalIds: ["g2", "g3"] }]);
  });
  it("tarea sin metas no genera días", () => {
    const tasks: Task[] = [makeTask("t1", [])];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([]);
  });
  it("distribuye cuando hay una meta mas grande que el tope diario", () => {
    const tasks: Task[] = [
      makeTask("t1", [
        makeGoal("g1", { position: 1 }),
        makeGoal("g2", { position: 2, estMinutes: 90 }),
        makeGoal("g3", { position: 3 }),
      ]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([
      { date: "2026-10-26", goalIds: ["g1"] },
      { date: "2026-10-27", goalIds: ["g2"] },
      { date: "2026-10-28", goalIds: ["g3"] },
    ]);
  });
  it("dos tareas no comparten dia", () => {
    const tasks: Task[] = [
      makeTask("t1", [makeGoal("g1", { estMinutes: 30 })]),
      makeTask("t2", [makeGoal("g2", { estMinutes: 30 })]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([
      { date: "2026-10-26", goalIds: ["g1"] },
      { date: "2026-10-27", goalIds: ["g2"] },
    ]);
  });
  it("las tareas se procesan por position, no por el orden de la lista", () => {
    const tasks: Task[] = [
      makeTask("t2", [makeGoal("g2", { estMinutes: 30 })], { position: 2 }),
      makeTask("t1", [makeGoal("g1", { estMinutes: 30 })], { position: 1 }),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([
      { date: "2026-10-26", goalIds: ["g1"] },
      { date: "2026-10-27", goalIds: ["g2"] },
    ]);
  });
  it("las metas se procesan por position, no por el orden de la lista", () => {
    const tasks: Task[] = [
      makeTask("t2", [
        makeGoal("g2", { estMinutes: 30, position: 2 }),
        makeGoal("g1", { estMinutes: 30, position: 1 }),
      ]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-26",
    };

    const result = generarAgenda(tasks, settings, PAST_DAY);

    expect(result).toEqual([{ date: "2026-10-26", goalIds: ["g1", "g2"] }]);
  });
  it("la agenda no empieza antes del día activo", () => {
    const tasks: Task[] = [
      makeTask("t2", [makeGoal("g1", { estMinutes: 30, position: 1 })]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-01",
    };

    const result = generarAgenda(tasks, settings, "2026-10-28");

    expect(result).toEqual([{ date: "2026-10-28", goalIds: ["g1"] }]);
  });
});
