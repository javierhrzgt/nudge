import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

interface CreateManualSessionInput {
  startedAt: Date;
  localDate: string;
  duration: number;
  goalIds: string[];
}

export function useCreateManualSession(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateManualSessionInput) => {
      const { error } = await supabase.rpc("create_manual_session", {
        p_started_at: input.startedAt.toISOString(),
        p_local_date: input.localDate,
        p_duration: input.duration,
        p_goal_ids: input.goalIds,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] }),
  });
}
