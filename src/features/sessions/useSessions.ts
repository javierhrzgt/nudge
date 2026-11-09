import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { mapClosedSessions } from "./mapClosedSessions";

export function useSessions(userId: string) {
  return useQuery({
    queryKey: ["sessions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select(
          "id,started_at,local_date,duration_minutes,goals(id,title,est_minutes)",
        )
        .eq("user_id", userId)
        .not("duration_minutes", "is", null)
        .order("started_at", { ascending: false });

      if (error) throw new Error(error.message);

      return mapClosedSessions(data);
    },
  });
}
