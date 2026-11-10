import { Alert, Center, Loader, Stack, Text } from "@mantine/core";
import { useSessions } from "../sessions/useSessions";
import { toPaceSessions } from "../../lib/stats/toPaceSessions";
import { calculateTotals } from "../../lib/stats/calculateTotals";

interface SummaryTabProps {
  userId: string;
}
export default function SummaryTab({ userId }: Readonly<SummaryTabProps>) {
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
        <Alert color="red">No se pudieron cargar las sesiones</Alert>
      </Center>
    );

  if (sessionsQuery.data.length === 0)
    return (
      <Text mt="md" ta="center">
        Aún no hay sesiones registradas
      </Text>
    );

  const paceSessions = toPaceSessions(sessionsQuery.data);
  const totals = calculateTotals(paceSessions);

  return (
    <Stack mt="md">
      <Text>Tiempo real: {totals.realMinutes} min</Text>
      <Text>Tiempo estimado: {totals.estimatedMinutes} min</Text>
      <Text>Sesiones cerradas: {sessionsQuery.data.length}</Text>
    </Stack>
  );
}
