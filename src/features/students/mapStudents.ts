export interface StudentRow {
  student_id: string;
  student: { display_name: string } | null;
}

export interface Student {
  studentId: string;
  displayName: string;
}

export function mapStudents(rows: StudentRow[]): Student[] {
  const students = rows.map((row) => {
    if (row.student === null)
      throw new Error("Perfil de estudiante no encontrado");

    return { studentId: row.student_id, displayName: row.student.display_name };
  });
  return students.toSorted((a, b) =>
    a.displayName.localeCompare(b.displayName, "es"),
  );
}
