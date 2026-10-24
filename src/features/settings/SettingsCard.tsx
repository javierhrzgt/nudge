import { Card, Center, Loader, Stack, Text } from "@mantine/core";
import { useSettings } from "./useSettings";

interface SettingsProps {
  userId: string;
}

export default function SettingsCard({ userId }: Readonly<SettingsProps>) {
  const { data, isPending, error } = useSettings(userId);

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
