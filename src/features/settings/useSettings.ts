import { useQuery } from "@tanstack/react-query";
import { mapSettingsRow } from "./mapSettings";
import { supabase } from "../../lib/supabase";

export function useSettings(userId: string) {
  return useQuery({
    queryKey: ["settings", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("work_days,daily_minutes,start_date,timezone")
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);

      return mapSettingsRow(data);
    },
  });
}
