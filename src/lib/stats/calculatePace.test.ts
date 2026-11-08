import { describe, it, expect } from "vitest";
import { calculatePace } from "./calculatePace";
import type { PaceSession } from "./types";

function makeSession(overrides: Partial<PaceSession> = {}): PaceSession {
  return {
    durationMinutes: 10,
    estimatedMinutes: 10,
    ...overrides,
  };
}

describe("calculatePace", () => {
  it("sin sesiones devuelve null", () => {
    const sessions: PaceSession[] = [];
    const res = calculatePace(sessions);

    expect(res).toBeNull();
  });

  it("cuando ninguna sesión tiene metas devuelve null", () => {
    const sessions: PaceSession[] = [
      makeSession({ durationMinutes: 30, estimatedMinutes: 0 }),
      makeSession({ durationMinutes: 40, estimatedMinutes: 0 }),
      makeSession({ durationMinutes: 10, estimatedMinutes: 0 }),
    ];
    const res = calculatePace(sessions);

    expect(res).toBeNull();
  });
  it("ignora los minutos de las sesiones sin metas", () => {
    const sessions: PaceSession[] = [
      makeSession({ durationMinutes: 10, estimatedMinutes: 10 }),
      makeSession({ durationMinutes: 60, estimatedMinutes: 0 }),
    ];
    const res = calculatePace(sessions);

    expect(res).toBe(1);
  });
  it("devuelve 1 cuando la duración real es igual a la estimada", () => {
    const sessions: PaceSession[] = [
      makeSession({ durationMinutes: 10, estimatedMinutes: 10 }),
    ];
    const res = calculatePace(sessions);

    expect(res).toBe(1);
  });
  it("devuelve más de 1 cuando la sesión dura más que lo estimado", () => {
    const sessions: PaceSession[] = [
      makeSession({ durationMinutes: 10, estimatedMinutes: 5 }),
    ];
    const res = calculatePace(sessions);

    expect(res).toBe(2);
  });
  it("devuelve menos de 1 cuando la sesión dura menos que lo estimado", () => {
    const sessions: PaceSession[] = [
      makeSession({ durationMinutes: 5, estimatedMinutes: 10 }),
    ];
    const res = calculatePace(sessions);

    expect(res).toBe(0.5);
  });
  it("divide el total real entre el total estimado en vez de promediar los ritmos", () => {
    const sessions: PaceSession[] = [
      makeSession({ durationMinutes: 20, estimatedMinutes: 10 }),
      makeSession({ durationMinutes: 100, estimatedMinutes: 100 }),
    ];
    const res = calculatePace(sessions);

    expect(res).toBeCloseTo(1.09, 2);
  });
});
