import { Loader, Stack, Text } from "@mantine/core";
import { useAgenda } from "./useAgenda";

interface TodayScreenProps {
  userId: string;
}

export default function TodayScreen({ userId }: Readonly<TodayScreenProps>) {
  const res = useAgenda(userId);

  if (res.status === "pending") return <Loader />;
  if (res.status === "error") return <Text>{res.error.message}</Text>;
  return (
    <Stack>
      <Text>{res.today}</Text>
      {res.agenda.map((day) => (
        <Text key={day.date}>
          {day.date}: {day.goalIds.join(", ")}
        </Text>
      ))}
    </Stack>
  );
}
