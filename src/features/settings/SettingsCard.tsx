import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Card, Center, Loader, Stack, Text } from "@mantine/core";
import { mapSettingsRow } from "./mapSettings";

interface SettingsProps {
  userId: string;
}

export default function SettingsCard({ userId }: Readonly<SettingsProps>) {
  const { data, isPending, error } = useQuery({
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

  if (isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (error) return <Text>{error.message}</Text>;
  return (
    <Card>
      <Stack>
        <Text>{data.dailyMinutes}</Text>
        <Text>{data.startDate}</Text>
        <Text>{data.timezone}</Text>
        <Text>{data.workDays.join(", ")}</Text>
      </Stack>
    </Card>
  );
}
