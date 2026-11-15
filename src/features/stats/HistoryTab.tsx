import { Alert, Center, Loader, Stack, Text } from "@mantine/core";
import { useSessions } from "../sessions/useSessions";

interface HistoryTabProps {
  userId: string;
}

export default function HistoryTab({ userId }: Readonly<HistoryTabProps>) {
  const sessionsQuery = useSessions(userId);
  if (sessionsQuery.isPending)
    return (
      <Center mt="md">
        <Loader />
      </Center>
    );

  if (sessionsQuery.isError)
    return (
      <Center mt="md">
        <Alert color="red">
          No se pudo cargar el historial de las sesiones
        </Alert>
      </Center>
    );

  if (sessionsQuery.data.length === 0)
    return (
      <Text mt="md" ta="center">
        Aún no hay sesiones registradas
      </Text>
    );

  return (
    <Stack mt="md">
      {sessionsQuery.data.map((session) => (
        <Text key={session.id}>
          {session.localDate} {session.durationMinutes} min
        </Text>
      ))}
    </Stack>
  );
}
