import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

interface FinishSessionInput {
  sessionId: string;
  duration: number;
  goalIds: string[];
}

export function useFinishSession(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: FinishSessionInput) => {
      const { error } = await supabase.rpc("finish_session", {
        p_session_id: input.sessionId,
        p_duration: input.duration,
        p_goal_ids: input.goalIds,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["openSession", userId] }),
        queryClient.invalidateQueries({ queryKey: ["tasks", userId] }),
      ]),
  });
}
