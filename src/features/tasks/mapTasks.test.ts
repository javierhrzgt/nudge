import { describe, it, expect } from "vitest";
import { mapTasks, type GoalRow, type TaskRow } from "./mapTasks";

describe("mapTasks", () => {
  it("convierte filas de la base en tareas de la agenda", () => {
    const goals: GoalRow[] = [
      {
        id: "g1",
        title: "goal",
        est_minutes: 30,
        completed_on: null,
        position: 1,
      },
    ];
    const tasks: TaskRow[] = [{ id: "t1", position: 1, goals }];

    const result = mapTasks(tasks);

    expect(result).toEqual([
      {
        id: "t1",
        position: 1,
        goals: [
          {
            id: "g1",
            title: "goal",
            estMinutes: 30,
            position: 1,
            completedOn: null,
          },
        ],
      },
    ]);
  });
});
