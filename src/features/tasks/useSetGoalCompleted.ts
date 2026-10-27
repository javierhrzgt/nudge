import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

interface SetCompleted {
  goalId: string;
  date: string;
}

export function useSetGoalCompleted(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, date }: SetCompleted) => {
      const { error } = await supabase.rpc("set_goal_completed", {
        p_goal_id: goalId,
        p_date: date,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] }),
  });
}
