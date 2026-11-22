import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { mapProfile } from "./mapProfile";

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name,role")
        .eq("id", userId)
        .single();

      if (error) throw new Error(error.message);

      return mapProfile(data);
    },
  });
}
