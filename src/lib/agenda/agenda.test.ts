import { describe, it, expect } from "vitest";
import { generarAgenda } from "./agenda";
import type { Settings, Task } from "./types";
import { makeGoal, makeTask } from "./testHelpers";

const PAST_DAY = "2000-01-01";

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
  it("los minutos hechos hoy descuentan del presupuesto de hoy", () => {
    const tasks: Task[] = [
      makeTask("t2", [
        makeGoal("g1", {
          estMinutes: 30,
          position: 1,
          completedOn: "2026-10-28",
        }),
        makeGoal("g2", { estMinutes: 30, position: 2 }),
        makeGoal("g3", { estMinutes: 30, position: 3 }),
        makeGoal("g4", { estMinutes: 30, position: 4 }),
      ]),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-01",
    };

    const result = generarAgenda(tasks, settings, "2026-10-28");

    expect(result).toEqual([
      { date: "2026-10-28", goalIds: ["g2"] },
      { date: "2026-10-29", goalIds: ["g3", "g4"] },
    ]);
  });
  it("el descuento es solo para el primer dia de la agenda", () => {
    const tasks: Task[] = [
      makeTask(
        "t1",
        [
          makeGoal("g0", {
            estMinutes: 30,
            position: 1,
            completedOn: "2026-10-28",
          }),
          makeGoal("g1", { estMinutes: 30, position: 2 }),
        ],
        { position: 1 },
      ),
      makeTask(
        "t2",
        [
          makeGoal("g2", { estMinutes: 30, position: 1 }),
          makeGoal("g3", { estMinutes: 30, position: 2 }),
        ],
        { position: 2 },
      ),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-01",
    };

    const result = generarAgenda(tasks, settings, "2026-10-28");

    expect(result).toEqual([
      { date: "2026-10-28", goalIds: ["g1"] },
      { date: "2026-10-29", goalIds: ["g2", "g3"] },
    ]);
  });
  it("hoy ya cubriste el presupuesto", () => {
    const tasks: Task[] = [
      makeTask(
        "t1",
        [
          makeGoal("g0", {
            estMinutes: 60,
            position: 1,
            completedOn: "2026-10-28",
          }),
          makeGoal("g1", { estMinutes: 30, position: 2 }),
        ],
        { position: 1 },
      ),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-01",
    };

    const result = generarAgenda(tasks, settings, "2026-10-28");

    expect(result).toEqual([{ date: "2026-10-29", goalIds: ["g1"] }]);
  });
  it("si hoy se cubrió el presupuesto se corre al siguiente dia hábil", () => {
    const tasks: Task[] = [
      makeTask(
        "t1",
        [
          makeGoal("g0", {
            estMinutes: 60,
            position: 1,
            completedOn: "2026-10-30",
          }),
          makeGoal("g1", { estMinutes: 30, position: 2 }),
        ],
        { position: 1 },
      ),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-01",
    };

    const result = generarAgenda(tasks, settings, "2026-10-30");

    expect(result).toEqual([{ date: "2026-11-02", goalIds: ["g1"] }]);
  });
  it("una meta completada ayer no descuenta del presupuesto de hoy", () => {
    const tasks: Task[] = [
      makeTask(
        "t1",
        [
          makeGoal("g0", {
            estMinutes: 60,
            position: 1,
            completedOn: "2026-10-27",
          }),
          makeGoal("g1", { estMinutes: 30, position: 2 }),
          makeGoal("g2", { estMinutes: 30, position: 3 }),
        ],
        { position: 1 },
      ),
    ];
    const settings: Settings = {
      workDays: [1, 2, 3, 4, 5],
      dailyMinutes: 60,
      startDate: "2026-10-01",
    };

    const result = generarAgenda(tasks, settings, "2026-10-28");

    expect(result).toEqual([{ date: "2026-10-28", goalIds: ["g1", "g2"] }]);
  });
});
