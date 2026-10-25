import { Alert, Button, Loader, Stack, Text } from "@mantine/core";
import { useSettings } from "../settings/useSettings";
import { useOpenSession } from "./useOpenSession";
import { useStartSession } from "./useStartSession";

interface StartSessionButtonProps {
  userId: string;
}

export default function StartSessionButton({
  userId,
}: Readonly<StartSessionButtonProps>) {
  const settings = useSettings(userId);
  const openSession = useOpenSession(userId);
  const startSession = useStartSession(userId);

  if (settings.isPending || openSession.isPending) return <Loader />;
  if (settings.error ?? openSession.error)
    return <Text>{(settings.error ?? openSession.error)?.message}</Text>;
  if (!settings.data) return null;
  const timezone = settings.data.timezone;
  if (openSession.data) return <Text>Sesión en curso</Text>;

  return (
    <Stack>
      {startSession.error && (
        <Alert color="red">{startSession.error.message}</Alert>
      )}
      <Button
        loading={startSession.isPending}
        onClick={() => startSession.mutate(timezone)}
      >
        Iniciar sesión de estudio
      </Button>
    </Stack>
  );
}
