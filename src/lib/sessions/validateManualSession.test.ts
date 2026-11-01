import { describe, it, expect } from "vitest";
import { validateManualSession } from "./validateManualSession";
import { addMinutes, addSeconds } from "date-fns";

const now = new Date("2026-11-01T12:00:00Z");

describe("validateManualSession", () => {
  it("datos correctos devuelve lista vacía", () => {
    const startedAt = addMinutes(now, -60);
    const duration = 15;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([]);
  });
  it("duración 0 es inválida", () => {
    const startedAt = addMinutes(now, -60);
    const duration = 0;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([
      "La duración debe ser un número entero entre 1 y 1440 minutos",
    ]);
  });
  it("duración 1 es válida (límite inferior)", () => {
    const startedAt = addMinutes(now, -60);
    const duration = 1;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([]);
  });
  it("duración 1440 es válida (límite superior)", () => {
    const startedAt = addMinutes(now, -60);
    const duration = 1440;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([]);
  });
  it("duración 1441 es inválida", () => {
    const startedAt = addMinutes(now, -60);
    const duration = 1441;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([
      "La duración debe ser un número entero entre 1 y 1440 minutos",
    ]);
  });
  it("duración con decimales es inválida", () => {
    const startedAt = addMinutes(now, -60);
    const duration = 1.5;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([
      "La duración debe ser un número entero entre 1 y 1440 minutos",
    ]);
  });
  it("falta la duración (vacía)", () => {
    const startedAt = addMinutes(now, -60);
    const duration = null;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual(["Indica cuántos minutos duró la sesión"]);
  });
  it("falta fecha u hora de inicio", () => {
    const startedAt = null;
    const duration = 20;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual(["Elige la fecha y la hora de inicio"]);
  });
  it("inicio en el futuro es inválido", () => {
    const startedAt = addMinutes(now, 60);
    const duration = 20;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual(["La sesión no puede empezar en el futuro"]);
  });
  it("inicio 4 minutos en el futuro es válido (dentro de la tolerancia)", () => {
    const startedAt = addMinutes(now, 4);
    const duration = 20;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([]);
  });
  it("inicio 5 minutos en el futuro es válido (límite de la tolerancia)", () => {
    const startedAt = addMinutes(now, 5);
    const duration = 20;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([]);
  });
  it("inicio 5 minutos y 1 segundo en el futuro es inválido (fuera de la tolerancia)", () => {
    const startedAt = addSeconds(addMinutes(now, 5), 1);
    const duration = 20;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual(["La sesión no puede empezar en el futuro"]);
  });
  it("dos problemas a la vez devuelve dos errores", () => {
    const startedAt = addMinutes(now, 6);
    const duration = null;
    const res = validateManualSession(startedAt, duration, now);
    expect(res).toEqual([
      "La sesión no puede empezar en el futuro",
      "Indica cuántos minutos duró la sesión",
    ]);
  });
});
