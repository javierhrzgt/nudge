import { describe, it, expect } from "vitest";
import { mapStudents, type StudentRow } from "./mapStudents";

describe("mapStudents", () => {
  it("convierte una fila", () => {
    const rows: StudentRow[] = [
      { student_id: "s1", student: { display_name: "Zoe" } },
    ];
    const res = mapStudents(rows);

    expect(res).toEqual([{ studentId: "s1", displayName: "Zoe" }]);
  });
  it("ordena por nombre, con acentos", () => {
    const rows: StudentRow[] = [
      { student_id: "s3", student: { display_name: "Zoe" } },
      { student_id: "s1", student: { display_name: "Álvaro" } },
      { student_id: "s2", student: { display_name: "Bruno" } },
    ];
    const res = mapStudents(rows);

    expect(res).toEqual([
      { studentId: "s1", displayName: "Álvaro" },
      { studentId: "s2", displayName: "Bruno" },
      { studentId: "s3", displayName: "Zoe" },
    ]);
  });
  it("devuelve lista vacía con entrada vacía", () => {
    const rows: StudentRow[] = [];
    const res = mapStudents(rows);

    expect(res).toEqual([]);
  });
  it("rechaza un estudiante sin perfil", () => {
    const rows: StudentRow[] = [{ student_id: "s1", student: null }];
    expect(() => mapStudents(rows)).toThrow(
      "Perfil de estudiante no encontrado",
    );
  });
});
