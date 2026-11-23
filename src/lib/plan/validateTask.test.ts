import { describe, it, expect } from "vitest";
import { validateTask } from "./validateTask";

describe("validateTask", () => {
  it("titulo correcto devuelve una lista vacía", () => {
    const title = "SQL Básico";
    const res = validateTask(title);

    expect(res).toEqual([]);
  });
  it("titulo vacío es inválido", () => {
    const title = "";
    const res = validateTask(title);

    expect(res).toEqual(["El título no puede estar vacío"]);
  });
  it("titulo solo de espacios es inválido", () => {
    const title = "      ";
    const res = validateTask(title);

    expect(res).toEqual(["El título no puede estar vacío"]);
  });
  it("100 caracteres es válido", () => {
    const title = "a".repeat(100);
    const res = validateTask(title);

    expect(res).toEqual([]);
  });
  it("101 caracteres es inválido", () => {
    const title = "a".repeat(101);
    const res = validateTask(title);

    expect(res).toEqual(["El título no puede tener más de 100 caracteres"]);
  });
});
