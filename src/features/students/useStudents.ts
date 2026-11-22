import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { mapStudents } from "./mapStudents";

export function useStudents(teacherId: string) {
  return useQuery({
    queryKey: ["students", teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_students")
        .select(
          "student_id,student:profiles!teacher_students_student_id_fkey(display_name)",
        )
        .eq("teacher_id", teacherId)
        .eq("status", "active");

      if (error) throw new Error(error.message);

      return mapStudents(data);
    },
  });
}
