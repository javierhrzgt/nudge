import { describe, it, expect } from "vitest";
import { activeDay } from "./activeDay";

describe("activeDay", () => {
  it("sin sesión abierta devuelve la fecha local de hoy", () => {
    const now = new Date("2026-10-28T03:00:00Z");
    const timeZone = "America/Guatemala";

    const localDate = activeDay(now, timeZone, null);
    expect(localDate).toBe("2026-10-27");
  });
});
