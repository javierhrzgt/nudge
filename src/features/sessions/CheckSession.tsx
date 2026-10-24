import { Card, Center, Loader, Stack, Text } from "@mantine/core";
import { useOpenSession } from "./useOpenSession";

interface CheckSessionProps {
  userId: string;
}

export default function CheckSession({ userId }: Readonly<CheckSessionProps>) {
  const { data, isPending, error } = useOpenSession(userId);

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
