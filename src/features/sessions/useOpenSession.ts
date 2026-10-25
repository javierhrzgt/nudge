import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { mapSession } from "./mapSession";

export function useOpenSession(userId: string) {
  return useQuery({
    queryKey: ["openSession", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("started_at,local_date")
        .eq("user_id", userId)
        .is("duration_minutes", null)
        .maybeSingle();

      if (error) throw new Error(error.message);

      return mapSession(data);
    },
  });
}
