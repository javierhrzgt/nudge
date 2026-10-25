import { describe, it, expect } from "vitest";
import type { OpenSession } from "./types";
import { isAbandoned } from "./isAbandoned";

describe("isAbandoned", () => {
  it("sesión abierta hace 1 hora", () => {
    const now = new Date("2026-10-24T07:30:00Z");
    const openSession: OpenSession = {
      startedAt: "2026-10-24T06:30:00Z",
      localDate: "2026-10-24",
    };
    const result = isAbandoned(now, openSession);
    expect(result).toBe(false);
  });
  it("justo en el umbral de 6 horas", () => {
    const now = new Date("2026-10-24T07:30:00Z");
    const openSession: OpenSession = {
      startedAt: "2026-10-24T01:30:00Z",
      localDate: "2026-10-23",
    };
    const result = isAbandoned(now, openSession);
    expect(result).toBe(false);
  });
  it("hace más de 6 horas", () => {
    const now = new Date("2026-10-24T07:30:00Z");
    const openSession: OpenSession = {
      startedAt: "2026-10-24T00:30:00Z",
      localDate: "2026-10-23",
    };
    const result = isAbandoned(now, openSession);
    expect(result).toBe(true);
  });
});
