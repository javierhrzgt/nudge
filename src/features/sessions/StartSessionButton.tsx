import { Alert, Button, Loader, Stack, Text } from "@mantine/core";
import { useSettings } from "../settings/useSettings";
import { useOpenSession } from "./useOpenSession";
import { useStartSession } from "./useStartSession";
import { useState } from "react";
import FinishSessionModal from "./FinishSessionModal";

interface StartSessionButtonProps {
  userId: string;
}

export default function StartSessionButton({
  userId,
}: Readonly<StartSessionButtonProps>) {
  const [opened, setOpened] = useState(false);
  const settings = useSettings(userId);
  const openSession = useOpenSession(userId);
  const startSession = useStartSession(userId);

  if (settings.isPending || openSession.isPending) return <Loader />;
  if (settings.error ?? openSession.error)
    return <Text>{(settings.error ?? openSession.error)?.message}</Text>;
  if (!settings.data) return null;
  const timezone = settings.data.timezone;
  if (openSession.data)
    return (
      <Stack>
        <Text>Sesión en curso</Text>
        <Button onClick={() => setOpened(true)}>Terminar sesión</Button>
        {opened && (
          <FinishSessionModal
            session={openSession.data}
            userId={userId}
            onClose={() => setOpened(false)}
          />
        )}
      </Stack>
    );

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
