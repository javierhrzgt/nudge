import { describe, it, expect } from "vitest";
import { activeDay } from "./activeDay";
import type { OpenSession } from "./types";

describe("activeDay", () => {
  it("sin sesión abierta devuelve la fecha local de hoy", () => {
    const now = new Date("2026-10-28T03:00:00Z");
    const timeZone = "America/Guatemala";

    const localDate = activeDay(now, timeZone, null);
    expect(localDate).toBe("2026-10-27");
  });
  it("sesión abierta que cruza la medianoche devuelve su día de inicio", () => {
    const openSession: OpenSession = {
      startedAt: "2026-10-28T04:30:00Z",
      localDate: "2026-10-27",
    };
    const now = new Date("2026-10-28T07:30:00Z");
    const timeZone = "America/Guatemala";

    const localDate = activeDay(now, timeZone, openSession);
    expect(localDate).toBe("2026-10-27");
  });
  it("sesión abierta pasado el umbral devuelve hoy", () => {
    const openSession: OpenSession = {
      startedAt: "2026-10-28T00:00:00Z",
      localDate: "2026-10-27",
    };
    const now = new Date("2026-10-28T07:30:00Z");
    const timeZone = "America/Guatemala";

    const localDate = activeDay(now, timeZone, openSession);
    expect(localDate).toBe("2026-10-28");
  });
  it("sesión abierta exactamente en el umbral sigue activa", () => {
    const openSession: OpenSession = {
      startedAt: "2026-10-28T01:30:00Z",
      localDate: "2026-10-27",
    };
    const now = new Date("2026-10-28T07:30:00Z");
    const timeZone = "America/Guatemala";

    const localDate = activeDay(now, timeZone, openSession);
    expect(localDate).toBe("2026-10-27");
  });
  it("sesión abierta un minuto pasado el umbral ya está abandonada", () => {
    const openSession: OpenSession = {
      startedAt: "2026-10-28T01:29:00Z",
      localDate: "2026-10-27",
    };
    const now = new Date("2026-10-28T07:30:00Z");
    const timeZone = "America/Guatemala";

    const localDate = activeDay(now, timeZone, openSession);
    expect(localDate).toBe("2026-10-28");
  });
});
