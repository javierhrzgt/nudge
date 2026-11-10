import { Alert, Center, Loader, Text } from "@mantine/core";
import { useSessions } from "../sessions/useSessions";

interface SummaryTabProps {
  userId: string;
}
export default function SummaryTab({ userId }: Readonly<SummaryTabProps>) {
  const sessionsQuery = useSessions(userId);
  if (sessionsQuery.isPending)
    return (
      <Center>
        <Loader />
      </Center>
    );

  if (sessionsQuery.isError)
    return (
      <Center>
        <Alert color="red">No se pudieron cargar las sesiones</Alert>
      </Center>
    );

  return <Text>Sesiones cerradas: {sessionsQuery.data.length}</Text>;
}
