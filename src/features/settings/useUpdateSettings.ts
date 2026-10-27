import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Settings } from "../../lib/agenda/types";
import { supabase } from "../../lib/supabase";
import { validateSettings } from "../../lib/settings/validateSettings";

export function useUpdateSettings(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Settings) => {
      const errors = validateSettings(values);
      if (errors.length > 0) throw new Error(errors.join(". "));

      const { error } = await supabase
        .from("settings")
        .update({
          work_days: values.workDays,
          daily_minutes: values.dailyMinutes,
          start_date: values.startDate,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["settings", userId] }),
  });
}
