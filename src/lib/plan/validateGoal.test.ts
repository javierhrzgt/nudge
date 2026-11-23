import { describe, it, expect } from "vitest";
import { validateGoal } from "./validateGoal";

describe("validateGoal", () => {
  it("meta correcta devuelve una lista vacía", () => {
    const newTitle = "Leer capítulo 2";
    const estMinutes = 15;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual([]);
  });
  it("título vacío es inválido", () => {
    const newTitle = "";
    const estMinutes = 15;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual(["El título no puede estar vacío"]);
  });
  it("101 caracteres en el título es inválido", () => {
    const newTitle = "a".repeat(101);
    const estMinutes = 15;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual(["El título no puede tener más de 100 caracteres"]);
  });
  it("título vacío y minutos vacíos devuelve ambos errores", () => {
    const newTitle = "";
    const estMinutes = null;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual([
      "El título no puede estar vacío",
      "Indica cuántos minutos dura la meta",
    ]);
  });
  it("minutos vacíos (null) es inválido", () => {
    const newTitle = "Leer capítulo 2";
    const estMinutes = null;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual(["Indica cuántos minutos dura la meta"]);
  });
  it("estMinutes 0 es inválido", () => {
    const newTitle = "Leer capítulo 2";
    const estMinutes = 0;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual([
      "La duración debe ser un número entero entre 1 y 720 minutos",
    ]);
  });
  it("estMinutes 1 es válido", () => {
    const newTitle = "Leer capítulo 2";
    const estMinutes = 1;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual([]);
  });
  it("estMinutes 721 es inválido", () => {
    const newTitle = "Leer capítulo 2";
    const estMinutes = 721;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual([
      "La duración debe ser un número entero entre 1 y 720 minutos",
    ]);
  });
  it("estMinutes 720 es válido", () => {
    const newTitle = "Leer capítulo 2";
    const estMinutes = 720;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual([]);
  });
  it("estMinutes con decimales es inválido", () => {
    const newTitle = "Leer capítulo 2";
    const estMinutes = 15.3;
    const res = validateGoal(newTitle, estMinutes);

    expect(res).toEqual([
      "La duración debe ser un número entero entre 1 y 720 minutos",
    ]);
  });
});
