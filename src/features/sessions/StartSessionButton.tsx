import { Alert, Button, Group, Loader, Stack, Text } from "@mantine/core";
import { useSettings } from "../settings/useSettings";
import { useOpenSession } from "./useOpenSession";
import { useStartSession } from "./useStartSession";
import { useState } from "react";
import FinishSessionModal from "./FinishSessionModal";
import {
  ABANDONED_AFTER_HOURS,
  isAbandoned,
} from "../../lib/agenda/isAbandoned";
import DiscardSessionModal from "./DiscardSessionModal";
import ElapsedTime from "./ElapsedTime";

interface StartSessionButtonProps {
  userId: string;
}

export default function StartSessionButton({
  userId,
}: Readonly<StartSessionButtonProps>) {
  const [finishSessionId, setFinishSessionId] = useState<string | null>(null);
  const [discardSessionId, setDiscardSessionId] = useState<string | null>(null);
  const settings = useSettings(userId);
  const openSession = useOpenSession(userId);
  const startSession = useStartSession(userId);

  if (settings.isPending || openSession.isPending) return <Loader />;
  if (settings.error ?? openSession.error)
    return <Text>{(settings.error ?? openSession.error)?.message}</Text>;
  if (!settings.data) return null;
  const timezone = settings.data.timezone;
  const session = openSession.data;

  if (session) {
    const sessionAbandoned = isAbandoned(new Date(), session);
    return (
      <Stack>
        {sessionAbandoned ? (
          <Alert color={"yellow"}>
            Esta sesión lleva abierta más de {ABANDONED_AFTER_HOURS} horas
          </Alert>
        ) : (
          <Text>Sesión en curso</Text>
        )}
        <ElapsedTime startedAt={session.startedAt} />
        <Group grow>
          {sessionAbandoned && (
            <Button
              variant={"light"}
              onClick={() => setDiscardSessionId(session.id)}
            >
              Descartar sesión
            </Button>
          )}
          <Button onClick={() => setFinishSessionId(session.id)}>
            Terminar sesión
          </Button>
        </Group>
        {discardSessionId === session.id && (
          <DiscardSessionModal
            sessionId={session.id}
            userId={userId}
            onClose={() => setDiscardSessionId(null)}
          />
        )}
        {finishSessionId === session.id && (
          <FinishSessionModal
            session={session}
            userId={userId}
            onClose={() => setFinishSessionId(null)}
          />
        )}
      </Stack>
    );
  }

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
