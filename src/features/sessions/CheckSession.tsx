import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { mapSession } from "./mapSession";
import { Card, Center, Loader, Stack, Text } from "@mantine/core";

interface CheckSessionProps {
  userId: string;
}

export default function CheckSession({ userId }: Readonly<CheckSessionProps>) {
  const { data, isPending, error } = useQuery({
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
        {data ? (
          <>
            <Text>{data.startedAt}</Text>
            <Text>{data.localDate}</Text>
          </>
        ) : (
          <Text>Sin sesión abierta</Text>
        )}
      </Stack>
    </Card>
  );
}
