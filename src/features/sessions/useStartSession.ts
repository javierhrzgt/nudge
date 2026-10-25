import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatInTimeZone } from "date-fns-tz";
import { supabase } from "../../lib/supabase";

export function useStartSession(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (timezone: string) => {
      const startedAt = new Date();

      const { data, error } = await supabase.rpc("start_session", {
        p_started_at: startedAt.toISOString(),
        p_local_date: formatInTimeZone(startedAt, timezone, "yyyy-MM-dd"),
      });

      if (error) throw new Error(error.message);

      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["openSession", userId] }),
  });
}
