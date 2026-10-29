import { describe, it, expect } from "vitest";
import { validateSettings } from "./validateSettings";
import { makeSettings } from "../agenda/testHelpers";

describe("validateSettings", () => {
  it("valores correctos", () => {
    const res = validateSettings(makeSettings());
    expect(res).toEqual([]);
  });
  it("workDays vacío", () => {
    const res = validateSettings(makeSettings({ workDays: [] }));
    expect(res).toHaveLength(1);
  });
  it("un día fuera de 0 a 6 (por ejemplo 7)", () => {
    const res = validateSettings(makeSettings({ workDays: [-1, 1, 3, 5, 7] }));
    expect(res).toHaveLength(1);
  });
  it("un día fuera de 0 a 6 (por ejemplo -1)", () => {
    const res = validateSettings(makeSettings({ workDays: [-1, 1, 3] }));
    expect(res).toHaveLength(1);
  });
  it("dailyMinutes menor que 1", () => {
    const res = validateSettings(makeSettings({ dailyMinutes: 0 }));
    expect(res).toHaveLength(1);
  });
  it("dailyMinutes con decimales (por ejemplo 30.5)", () => {
    const res = validateSettings(makeSettings({ dailyMinutes: 30.5 }));
    expect(res).toHaveLength(1);
  });
  it("startDate que no sea una fecha valida yyyy-MM-dd (por ejemplo 'hola')", () => {
    const res = validateSettings(makeSettings({ startDate: "hola" }));
    expect(res).toHaveLength(1);
  });
  it("dos problemas a la vez", () => {
    const res = validateSettings(
      makeSettings({ workDays: [], startDate: "hola" }),
    );
    expect(res).toHaveLength(2);
  });
});
