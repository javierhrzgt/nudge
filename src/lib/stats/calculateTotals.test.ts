import { describe, it, expect } from "vitest";
import type { PaceSession } from "./types";
import { calculateTotals } from "./calculateTotals";

describe("calculateTotals", () => {
  it("suma los minutos reales de todas las sesiones", () => {
    const sessions: PaceSession[] = [
      { durationMinutes: 20, estimatedMinutes: 45 },
      { durationMinutes: 30, estimatedMinutes: 25 },
    ];

    const res = calculateTotals(sessions);
    expect(res.realMinutes).toEqual(50);
  });
  it("suma los minutos estimados de todas las sesiones", () => {
    const sessions: PaceSession[] = [
      { durationMinutes: 35, estimatedMinutes: 50 },
      { durationMinutes: 60, estimatedMinutes: 65 },
    ];

    const res = calculateTotals(sessions);
    expect(res.estimatedMinutes).toEqual(115);
  });
  it("toma en cuenta los minutos reales de las sesiones sin metas", () => {
    const sessions: PaceSession[] = [
      { durationMinutes: 40, estimatedMinutes: 0 },
      { durationMinutes: 70, estimatedMinutes: 90 },
    ];

    const res = calculateTotals(sessions);
    expect(res.realMinutes).toEqual(110);
  });
  it("devuelve cero si no hay sesiones", () => {
    const sessions: PaceSession[] = [];

    const res = calculateTotals(sessions);
    expect(res).toEqual({ realMinutes: 0, estimatedMinutes: 0 });
  });
});
