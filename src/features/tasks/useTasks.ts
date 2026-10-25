import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

export function useTasks(userId: string) {
  return useQuery({
    queryKey: ["tasks", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id,title,position,goals(id,title,est_minutes,position,completed_on)",
        )
        .is("archived_at", null)
        .is("goals.archived_at", null)
        .order("position")
        .order("position", { referencedTable: "goals" });

      if (error) throw new Error(error.message);

      return data;
    },
  });
}
