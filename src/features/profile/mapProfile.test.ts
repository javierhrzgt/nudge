import { describe, it, expect } from "vitest";
import { mapProfile } from "./mapProfile";

describe("mapProfile", () => {
  it("convierte un estudiante", () => {
    const row = { display_name: "Estudiante 1", role: "student" };
    const res = mapProfile(row);

    expect(res).toEqual({ displayName: "Estudiante 1", role: "student" });
  });
  it("convierte un profesor", () => {
    const row = { display_name: "Profesor 1", role: "teacher" };
    const res = mapProfile(row);

    expect(res).toEqual({ displayName: "Profesor 1", role: "teacher" });
  });
  it("rechaza un rol desconocido", () => {
    const row = { display_name: "Random 1", role: "admin" };

    expect(() => mapProfile(row)).toThrow('Rol desconocido: "admin"');
  });
});
